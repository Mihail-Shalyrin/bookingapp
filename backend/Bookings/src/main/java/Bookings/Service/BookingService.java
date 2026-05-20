package Bookings.Service;

import Bookings.DTO.BookingRequest;
import Bookings.Model.BookingMode;
import Bookings.Model.Bookings;
import Bookings.Model.Objects;
import Bookings.Model.Users;
import Bookings.Repository.BookingRepository;
import Bookings.Repository.ObjectRepository;
import Bookings.Repository.UserProjectRepository;
import Bookings.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ObjectRepository objectRepository;
    private final UserProjectRepository userProjectRepository;
    private final UserRepository userRepository;

    private static final LocalTime WORKDAY_END = LocalTime.of(18, 0);
    private static final LocalTime FUTURE_BOOKING_TIME_LIMIT = LocalTime.of(16, 0);
    private static final int WEEKLY_BOOKING_OCCURRENCES = 2;

    @Transactional
    public List<Bookings> createBooking(BookingRequest request, Users user) {

        if (request.getObjectId() == null) {
            throw new BookingValidationException("требуется id объекта");
        }
        if (request.getBookingMode() == null) {
            request.setBookingMode(BookingMode.ONE_TIME);
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new BookingValidationException("требуется начало и конец брони");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new BookingValidationException("конец должен быть позже начала");
        }

        Objects object = objectRepository.findById(request.getObjectId())
                .orElseThrow(() -> new BookingValidationException("объект не найден"));

        return switch (request.getBookingMode()) {
            case ONE_TIME -> List.of(createOneTimeBooking(request, object, user));
            case WEEKLY   -> createWeeklyBookings(request, object, user);
        };
    }

    @Transactional
    public void deleteBooking(Long bookingId, Users user) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Бронь не найдена"));

        boolean isOwner = booking.getUser().getId().equals(user.getId());
        boolean isAdmin = user.hasRole("ADMIN") || user.hasRole("SUPERADMIN");

        if (!isOwner && !isAdmin) {
            throw new BookingAccessDeniedException("Вы не можете удалить эту бронь");
        }

        bookingRepository.delete(booking);
        log.info("Booking deleted: ID={}, UserID={}", bookingId, user.getId());
    }

    private Bookings createOneTimeBooking(BookingRequest request, Objects object, Users user) {
        Bookings booking = new Bookings();
        booking.setObject(object);
        booking.setUser(user);
        booking.setBookingMode(BookingMode.ONE_TIME);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());

        String error = validateBooking(booking, user);
        if (error != null) {
            throw new BookingValidationException(error);
        }

        bookingRepository.save(booking);
        log.info("ONE_TIME booking saved: ID={}, ObjectID={}, UserID={}",
                booking.getId(), booking.getObject().getId(), user.getId());

        return booking;
    }

    private List<Bookings> createWeeklyBookings(BookingRequest request, Objects object, Users user) {
        List<Bookings> bookingsToSave = new ArrayList<>();

        for (int i = 0; i < WEEKLY_BOOKING_OCCURRENCES; i++) {
            Bookings weeklyBooking = new Bookings();
            weeklyBooking.setObject(object);
            weeklyBooking.setUser(user);
            weeklyBooking.setBookingMode(BookingMode.WEEKLY);
            weeklyBooking.setStartTime(request.getStartTime().plusWeeks(i));
            weeklyBooking.setEndTime(request.getEndTime().plusWeeks(i));

            String error = validateBooking(weeklyBooking, user);
            if (error != null) {
                String prefix = (i == 0)
                        ? "Current week booking error: "
                        : "Next week booking error: ";
                throw new BookingValidationException(prefix + error);
            }

            bookingsToSave.add(weeklyBooking);
        }

        bookingRepository.saveAll(bookingsToSave);

        bookingsToSave.forEach(saved ->
                log.info("WEEKLY booking saved: ObjectID={}, UserID={}, Start={}, End={}",
                        saved.getObject().getId(), user.getId(),
                        saved.getStartTime(), saved.getEndTime())
        );

        return bookingsToSave;
    }

    private String validateBooking(Bookings booking, Users user) {
        Objects object = booking.getObject();
        Objects.Type type = object.getType();

        if (object.getReservedForUser() != null) {
            boolean isOwner = object.getReservedForUser().getId().equals(user.getId());
            if (!isOwner) {
                return "Место уже зарезервировано за другим пользователем";
            }
        }

        if (object.getReservedForProject() != null) {
            boolean inProject = userProjectRepository.existsByUserIdAndProjectId(
                    user.getId(), object.getReservedForProject().getId()
            );
            if (!inProject) {
                return "Место уже зарезервировано за другим проектом";
            }
        }

        if (!isValidDuration(type, booking.getStartTime(), booking.getEndTime())) {
            return getDurationErrorMessage(type);
        }

        boolean roomConflict = bookingRepository.existsOverlappingBooking(
                object.getId(), booking.getStartTime(), booking.getEndTime()
        );
        if (roomConflict) {
            return "На указанный период времени место уже занято";
        }

        if (!user.hasRole("ADMIN") && !user.hasRole("SUPERADMIN")) {
            LocalDate bookingDate = booking.getStartTime().toLocalDate();
            LocalDateTime dayStart = bookingDate.atStartOfDay();
            LocalDateTime dayEnd   = bookingDate.plusDays(1).atStartOfDay();

            boolean hasSameTypeBookingForDay = bookingRepository.existsUserBookingByTypeForDay(
                    user.getId(), type, dayStart, dayEnd
            );

            if (hasSameTypeBookingForDay) {
                if (type == Objects.Type.ROOM) {
                    return "У вас уже забронирован стол на текущий день";
                } else if (type == Objects.Type.MEETING) {
                    return "У вас уже забронирована переговорная комната на текущий день";
                } else {
                    return "У вас уже есть бронь на текущий день";
                }
            }
        }

        if (!user.hasRole("ADMIN") && !user.hasRole("SUPERADMIN")) {
            LocalDate today = LocalDate.now();
            LocalDate requestedDate = booking.getStartTime().toLocalDate();
            LocalTime nowTime = LocalTime.now();

            LocalDateTime dayStart = today.atStartOfDay();
            LocalDateTime dayEnd   = today.plusDays(1).atStartOfDay();

            boolean hasBookingToday = bookingRepository.existsBookingForDay(
                    user.getId(), dayStart, dayEnd
            );

            if (requestedDate.isAfter(today)
                    && hasBookingToday
                    && nowTime.isBefore(FUTURE_BOOKING_TIME_LIMIT)) {
                return "Бронирование на следующий день доступно только после 16:00 при наличии брони на текущий день";
            }
        }

        return null;
    }

    private boolean isValidDuration(Objects.Type type, LocalDateTime start, LocalDateTime end) {
        long minutes = Duration.between(start, end).toMinutes();

        if (type == Objects.Type.ROOM) {
            boolean oneHour = minutes == 60;
            boolean twoHours = minutes == 120;
            boolean untilEndOfDay = end.toLocalTime().equals(WORKDAY_END) && minutes >= 60;
            return oneHour || twoHours || untilEndOfDay;
        }
        if (type == Objects.Type.MEETING) {
            boolean ok30 = minutes == 30;
            boolean ok60 = minutes == 60;
            boolean ok90 = minutes == 90;
            boolean untilEndOfDay = end.toLocalTime().equals(WORKDAY_END) && minutes >= 30;
            return ok30 || ok60 || ok90 || untilEndOfDay;
        }
        if (type == Objects.Type.HALL) {
            LocalTime startTime = start.toLocalTime();
            LocalTime endTime = end.toLocalTime();
            boolean startsAtMidnight = startTime.equals(LocalTime.MIDNIGHT);   // 00:00:00
            boolean endsAtEndOfDay = endTime.equals(LocalTime.of(23, 59, 59));
            boolean sameDay = start.toLocalDate().equals(end.toLocalDate());
            return startsAtMidnight && endsAtEndOfDay && sameDay;
        }
        return false;
    }

    private String getDurationErrorMessage(Objects.Type type) {
        if (type == Objects.Type.ROOM) {
            return "для комнаты разрешены промежутки в : 1 час, 2 часа или до конца рабочего дня";
        }
        if (type == Objects.Type.MEETING) {
            return "Для переговорной комнаты разрешены промежутки в : 30 минут, 1 час, 1.5 часа или до конца рабочего дня";
        }
        return "Неккоректная продолжительность брони";
    }
    // добавить в BookingService

    public List<Bookings> findAllOrByUsername(String username) {
        if (username == null || username.isBlank()) {
            return (List<Bookings>) bookingRepository.findAll();
        }
        return bookingRepository.findByUsernameContaining(username);
    }

    @Transactional
    public void deleteBookingAsAdmin(Long bookingId) {
        Bookings booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Бронь не найдена"));
        bookingRepository.delete(booking);
    }


    @Transactional
    public List<Bookings> createBookingFor(BookingRequest request, Long userId) {
        Users targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new BookingValidationException("пользователь не найден"));
        return createBooking(request, targetUser);
    }



}