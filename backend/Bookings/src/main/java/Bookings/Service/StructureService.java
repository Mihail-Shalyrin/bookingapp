package Bookings.Service;

import Bookings.DTO.*;
import Bookings.Model.*;
import Bookings.Repository.BookingRepository;
import Bookings.Repository.ObjectRepository;
import Bookings.Repository.UserProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StructureService {

    private final ObjectRepository roomRep;
    private final BookingRepository bookingRep;
    private final UserProjectRepository userProjectRepository;

    public List<OfficeDto> getObjectById(
            Users user,
            Long objectId,
            LocalDate date
    ) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end   = targetDate.atTime(LocalTime.MAX);

        Objects obj = roomRep.findVisibleObjectById(
                objectId,
                user.getId(),
                getAllowedTypes(user)
        ).orElseThrow(() -> new IllegalArgumentException(
                "объект не найден или недоступен"
        ));

        Map<Long, List<Bookings>> bookingsByObject = bookingRep
                .findBookingsForObjects(List.of(obj.getId()), start, end)
                .stream()
                .collect(Collectors.groupingBy(b -> b.getObject().getId()));

        return buildOfficeStructure(List.of(obj), bookingsByObject, start, end);
    }
    public List<OfficeDto> getAvailableRooms(Users user) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end   = today.atTime(LocalTime.MAX);

        List<Objects> objects = roomRep.findVisibleObjectsForUser(
                user.getId(),
                getAllowedTypes(user)
        );

        Map<Long, List<Bookings>> bookingsByObject;
        if (objects.isEmpty()) {
            bookingsByObject = Map.of();
        } else {
            List<Long> objectIds = objects.stream()
                    .map(Objects::getId)
                    .toList();

            bookingsByObject = bookingRep
                    .findBookingsForObjects(objectIds, start, end)
                    .stream()
                    .collect(Collectors.groupingBy(b -> b.getObject().getId()));
        }

        return buildOfficeStructure(objects, bookingsByObject, start, end);
    }
    public List<OfficeDto> getAvailableRooms1(Users user) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end   = today.atTime(LocalTime.MAX);

        List<Objects> objects = roomRep.findVisibleObjectsForUser(
                user.getId(),
                List.of(Objects.Type.values())
        );

        Map<Long, List<Bookings>> bookingsByObject;
        if (objects.isEmpty()) {
            bookingsByObject = Map.of();
        } else {
            List<Long> objectIds = objects.stream()
                    .map(Objects::getId)
                    .toList();

            bookingsByObject = bookingRep
                    .findBookingsForObjects(objectIds, start, end)
                    .stream()
                    .collect(Collectors.groupingBy(b -> b.getObject().getId()));
        }

        return buildOfficeStructure(objects, bookingsByObject, start, end);
    }
    public List<OfficeDto> findAvailableRoomsForUser(
            Users user,
            LocalDateTime start,
            LocalDateTime end,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        List<Objects.Type> types = (type != null)
                ? List.of(type)
                : List.of(Objects.Type.values()); // админ видит все типы, в том числе HALL

        List<Objects> objects = roomRep.findVisibleObjectsForUser(
                user.getId(),
                types
        );

        // дополнительная фильтрация по office/floor (если не было в репозитории)
        if (office != null && !office.isBlank()) {
            objects = objects.stream()
                    .filter(o -> o.getRoom().getFloor().getOffice().getCity().equalsIgnoreCase(office))
                    .toList();
        }
        if (floor != null) {
            objects = objects.stream()
                    .filter(o -> o.getRoom().getFloor().getNum() == floor)
                    .toList();
        }

        Map<Long, List<Bookings>> bookingsByObject;
        if (objects.isEmpty()) {
            bookingsByObject = Map.of();
        } else {
            List<Long> objectIds = objects.stream().map(Objects::getId).toList();
            bookingsByObject = bookingRep
                    .findBookingsForObjects(objectIds, start, end)
                    .stream()
                    .collect(Collectors.groupingBy(b -> b.getObject().getId()));
        }

        return buildOfficeStructure(objects, bookingsByObject, start, end);
    }

    /**
     * endpoint /rooms/available
     */
    public List<OfficeDto> findAvailableRooms(
            Users user,
            LocalDateTime start,
            LocalDateTime end,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        List<Objects.Type> allowedTypes = getAllowedTypes(user);

        if (type != null) {
            if (!allowedTypes.contains(type)) {
                throw new IllegalArgumentException("тип комнаты недоступен");
            }
            allowedTypes = List.of(type);
        }

        List<Objects> objects = roomRep.findAvailableRooms(
                user.getId(),
                allowedTypes,
                start,
                end,
                office,
                floor
        );

        Map<Long, List<Bookings>> bookingsByObject;
        if (objects.isEmpty()) {
            bookingsByObject = Map.of();
        } else {
            List<Long> objectIds = objects.stream()
                    .map(Objects::getId)
                    .toList();

            bookingsByObject = bookingRep
                    .findBookingsForObjects(objectIds, start, end)
                    .stream()
                    .collect(Collectors.groupingBy(b -> b.getObject().getId()));
        }

        return buildOfficeStructure(objects, bookingsByObject, start, end);
    }

    private List<Objects.Type> getAllowedTypes(Users user) {
        if (user.hasRole("ADMIN") || user.hasRole("SUPERADMIN")) {
            return List.of(Objects.Type.values());
        }
        return List.of(Objects.Type.ROOM, Objects.Type.MEETING);
    }

    private List<OfficeDto> buildOfficeStructure(
            List<Objects> objects,
            Map<Long, List<Bookings>> bookingsByObject,
            LocalDateTime start,
            LocalDateTime end
    ) {

        Map<Long, OfficeDto> officesMap =
                new LinkedHashMap<>();

        for (Objects obj : objects) {

            Room room = obj.getRoom();
            Floor floor = room.getFloor();
            Office office = floor.getOffice();

            // OFFICE
            OfficeDto officeDto =
                    officesMap.computeIfAbsent(
                            office.getId(),
                            id -> {

                                OfficeDto dto =
                                        new OfficeDto();

                                dto.setId(
                                        office.getId()
                                );

                                dto.setCity(
                                        office.getCity()
                                );

                                dto.setDepartment(
                                        office.getDepartment()
                                );

                                dto.setFloors(
                                        new ArrayList<>()
                                );

                                return dto;
                            });

            // FLOOR
            FloorDto floorDto =
                    officeDto.getFloors()
                            .stream()
                            .filter(f ->
                                    f.getId().equals(
                                            floor.getId()
                                    ))
                            .findFirst()
                            .orElseGet(() -> {

                                FloorDto dto =
                                        new FloorDto();

                                dto.setId(
                                        floor.getId()
                                );

                                dto.setNum(
                                        floor.getNum()
                                );

                                dto.setRooms(
                                        new ArrayList<>()
                                );

                                officeDto.getFloors()
                                        .add(dto);

                                return dto;
                            });

            // ROOM
            RoomDto roomDto =
                    floorDto.getRooms()
                            .stream()
                            .filter(r ->
                                    r.getId().equals(
                                            room.getId()
                                    ))
                            .findFirst()
                            .orElseGet(() -> {

                                RoomDto dto =
                                        new RoomDto();

                                dto.setId(
                                        room.getId()
                                );

                                dto.setNumber(
                                        room.getNumber()
                                );

                                dto.setObjects(
                                        new ArrayList<>()
                                );
                                if (start != null
                                        && end != null) {

                                    int totalPlaces =
                                            roomRep
                                                    .countTotalPlaces(
                                                            room.getId()
                                                    );

                                    int bookedPlaces =
                                            bookingRep
                                                    .countBookedPlaces(
                                                            room.getId(),
                                                            start,
                                                            end
                                                    );

                                    dto.setTotalPlaces(
                                            totalPlaces
                                    );

                                    dto.setBookedPlaces(
                                            bookedPlaces
                                    );

                                    dto.setLoad(
                                            calculateLoad(
                                                    totalPlaces,
                                                    bookedPlaces
                                            )
                                    );
                                }

                                floorDto.getRooms()
                                        .add(dto);

                                return dto;
                            });

            // OBJECT
            ObjectDto objectDto = new ObjectDto();
            objectDto.setId(obj.getId());
            objectDto.setName(obj.getName());
            objectDto.setSpot(obj.getSpot());
            objectDto.setType(obj.getType());

            List<Bookings> objBookings = bookingsByObject
                    .getOrDefault(obj.getId(), List.of());

            List<BookingInfoDto> bookingDtos = objBookings.stream()
                    .map(b -> {
                        BookingInfoDto dto = new BookingInfoDto();
                        dto.setBookingId(b.getId());
                        dto.setUserId(b.getUser().getId());
                        dto.setUsername(b.getUser().getUsername());
                        dto.setStartTime(b.getStartTime());
                        dto.setEndTime(b.getEndTime());
                        return dto;
                    })
                    .toList();

            objectDto.setBookings(bookingDtos);

            roomDto.getObjects().add(objectDto);
        }
        // ---------- агрегация нагрузки по этажам ----------
        for (OfficeDto officeDto : officesMap.values()) {
            for (FloorDto floorDto : officeDto.getFloors()) {
                int total = 0;
                int booked = 0;
                boolean hasStats = false;

                for (RoomDto roomDto : floorDto.getRooms()) {
                    if (roomDto.getTotalPlaces() != null) {
                        total += roomDto.getTotalPlaces();
                        booked += roomDto.getBookedPlaces() != null ? roomDto.getBookedPlaces() : 0;
                        hasStats = true;
                    }
                }

                if (hasStats) {
                    floorDto.setTotalPlaces(total);
                    floorDto.setBookedPlaces(booked);
                    floorDto.setLoad(calculateLoad(total, booked));
                }
            }
        }
        return new ArrayList<>(
                officesMap.values()
        );
    }
    private RoomLoad calculateLoad(
            int totalPlaces,
            int bookedPlaces
    ) {

        if (totalPlaces == 0) {
            return RoomLoad.LOW;
        }

        double ratio =
                (double) bookedPlaces
                        / totalPlaces;

        if (ratio <= 0.30) {
            return RoomLoad.LOW;
        }

        if (ratio <= 0.70) {
            return RoomLoad.MEDIUM;
        }

        return RoomLoad.HIGH;
    }
    public List<MyBookingsOfficeDto> getMyBookings(Users user) {
        List<Bookings> bookings = bookingRep.findMyBookingsWithStructure(user.getId());
        return buildMyBookingsStructure(bookings);
    }

    private List<MyBookingsOfficeDto> buildMyBookingsStructure(List<Bookings> bookings) {
        Map<Long, MyBookingsOfficeDto> officesMap = new LinkedHashMap<>();

        for (Bookings booking : bookings) {
            Objects obj = booking.getObject();
            Room room = obj.getRoom();
            Floor floor = room.getFloor();
            Office office = floor.getOffice();

            // OFFICE
            MyBookingsOfficeDto officeDto = officesMap.computeIfAbsent(
                    office.getId(),
                    id -> {
                        MyBookingsOfficeDto dto = new MyBookingsOfficeDto();
                        dto.setId(office.getId());
                        dto.setCity(office.getCity());
                        dto.setDepartment(office.getDepartment());
                        dto.setFloors(new ArrayList<>());
                        return dto;
                    }
            );

            // FLOOR
            MyBookingsFloorDto floorDto = officeDto.getFloors().stream()
                    .filter(f -> f.getId().equals(floor.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        MyBookingsFloorDto dto = new MyBookingsFloorDto();
                        dto.setId(floor.getId());
                        dto.setNum(floor.getNum());
                        dto.setRooms(new ArrayList<>());
                        officeDto.getFloors().add(dto);
                        return dto;
                    });

            // ROOM
            MyBookingsRoomDto roomDto = floorDto.getRooms().stream()
                    .filter(r -> r.getId().equals(room.getId()))
                    .findFirst()
                    .orElseGet(() -> {
                        MyBookingsRoomDto dto = new MyBookingsRoomDto();
                        dto.setId(room.getId());
                        dto.setNumber(room.getNumber());
                        dto.setBookings(new ArrayList<>());
                        floorDto.getRooms().add(dto);
                        return dto;
                    });

            // BOOKING
            MyBookingDto bookingDto = new MyBookingDto();
            bookingDto.setBookingId(booking.getId());
            bookingDto.setObjectId(obj.getId());
            bookingDto.setObjectName(obj.getName());
            bookingDto.setSpot(obj.getSpot());
            bookingDto.setType(obj.getType());
            bookingDto.setStartTime(booking.getStartTime());
            bookingDto.setEndTime(booking.getEndTime());
            bookingDto.setBookingMode(booking.getBookingMode());

            roomDto.getBookings().add(bookingDto);
        }

        return new ArrayList<>(officesMap.values());
    }
    public List<OfficeDto> getProjectRooms(Users user, Long projectId) {
        checkUserInProject(user, projectId);

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end   = today.atTime(LocalTime.MAX);

        List<Objects> objects = roomRep.findObjectsByProject(
                projectId,
                getAllowedTypes(user)
        );

        Map<Long, List<Bookings>> bookingsByObject = loadBookings(objects, start, end);

        return buildOfficeStructure(objects, bookingsByObject, start, end);
    }

    public List<OfficeDto> findProjectRoomsByPeriod(
            Users user,
            Long projectId,
            LocalDateTime start,
            LocalDateTime end,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        checkUserInProject(user, projectId);

        List<Objects.Type> allowedTypes = getAllowedTypes(user);

        if (type != null) {
            if (!allowedTypes.contains(type)) {
                throw new IllegalArgumentException("тип комнаты недоступен");
            }
            allowedTypes = List.of(type);
        }

        List<Objects> objects = roomRep.findProjectRoomsFiltered(
                projectId, allowedTypes, office, floor
        );

        Map<Long, List<Bookings>> bookingsByObject = loadBookings(objects, start, end);

        return buildOfficeStructure(objects, bookingsByObject, start, end);
    }

    public List<OfficeDto> getProjectObjectById(
            Users user,
            Long projectId,
            Long objectId,
            LocalDate date
    ) {
        checkUserInProject(user, projectId);

        LocalDate targetDate = date != null ? date : LocalDate.now();
        LocalDateTime start = targetDate.atStartOfDay();
        LocalDateTime end   = targetDate.atTime(LocalTime.MAX);

        Objects obj = roomRep.findVisibleObjectById(
                objectId, user.getId(), getAllowedTypes(user)
        ).orElseThrow(() -> new IllegalArgumentException(
                "объект не найден или недоступен"
        ));

        // дополнительно убедимся, что объект действительно из этого проекта
        if (obj.getReservedForProject() == null
                || !obj.getReservedForProject().getId().equals(projectId)) {
            throw new IllegalArgumentException(
                    "объект не принадлежит этому проекту"
            );
        }

        Map<Long, List<Bookings>> bookingsByObject = loadBookings(
                List.of(obj), start, end
        );

        return buildOfficeStructure(List.of(obj), bookingsByObject, start, end);
    }

// ---------- helpers ----------

    private void checkUserInProject(Users user, Long projectId) {
        boolean inProject = userProjectRepository.existsByUserIdAndProjectId(
                user.getId(), projectId
        );
        if (!inProject) {
            throw new BookingAccessDeniedException(
                    "Вы не состоите в этом проекте"
            );
        }
    }

    private Map<Long, List<Bookings>> loadBookings(
            List<Objects> objects,
            LocalDateTime start,
            LocalDateTime end
    ) {
        if (objects.isEmpty()) {
            return Map.of();
        }
        List<Long> objectIds = objects.stream().map(Objects::getId).toList();

        return bookingRep.findBookingsForObjects(objectIds, start, end)
                .stream()
                .collect(Collectors.groupingBy(b -> b.getObject().getId()));
    }
    public List<OfficeDto> getMyReservedObjects(
            Users user,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        // проверка типа, если задан
        if (type != null) {
            List<Objects.Type> allowedTypes = getAllowedTypes(user);
            if (!allowedTypes.contains(type)) {
                throw new IllegalArgumentException(
                        "тип комнаты недоступен для вашей роли"
                );
            }
        }

        List<Objects> objects = roomRep.findReservedForUser(
                user.getId(), office, floor, type
        );

        // брони не подгружаем — резерв персональный, конфликтов нет
        return buildOfficeStructure(objects, Map.of(), null, null);
    }
    public List<OfficeDto> getAllBookingsStructure(
            LocalDateTime start,
            LocalDateTime end,
            String office,
            Byte floor,
            Objects.Type type,
            String username
    ) {
        List<Objects> objects = roomRep.findAllWithFilters(office, floor, type);

        Map<Long, List<Bookings>> bookingsByObject;
        if (objects.isEmpty()) {
            bookingsByObject = Map.of();
        } else {
            List<Long> objectIds = objects.stream()
                    .map(Objects::getId)
                    .toList();

            String usernameFilter = (username != null && !username.isBlank())
                    ? username
                    : null;

            bookingsByObject = bookingRep
                    .findBookingsForObjectsByUsername(objectIds, start, end, usernameFilter)
                    .stream()
                    .collect(Collectors.groupingBy(b -> b.getObject().getId()));
        }

        // оставляем только объекты, у которых есть брони
        List<Objects> withBookings = objects.stream()
                .filter(obj -> bookingsByObject.containsKey(obj.getId()))
                .toList();

        return buildOfficeStructure(withBookings, bookingsByObject, start, end);
    }
    public List<OfficeDto> buildAdminStructure(List<Objects> objects) {
        return buildOfficeStructure(objects, Map.of(), null, null);
    }


    //просмотреть БРОНИ КОНКРЕТНОГО ЮЗЕРА
    public List<OfficeDto> getUserBookingsStructure(
            Long userId,
            LocalDateTime start,    // может быть null
            LocalDateTime end,      // может быть null
            String office,
            Byte floor,
            Objects.Type type
    ) {
        List<Objects> objects = roomRep.findAllWithFilters(office, floor, type);

        Map<Long, List<Bookings>> bookingsByObject;
        if (objects.isEmpty()) {
            bookingsByObject = Map.of();
        } else {
            List<Long> objectIds = objects.stream().map(Objects::getId).toList();

            List<Bookings> bookings = (start != null && end != null)
                    ? bookingRep.findBookingsForObjectsByUserId(objectIds, userId, start, end)
                    : bookingRep.findAllBookingsForObjectsByUserId(objectIds, userId);

            bookingsByObject = bookings.stream()
                    .collect(Collectors.groupingBy(b -> b.getObject().getId()));
        }

        List<Objects> withBookings = objects.stream()
                .filter(obj -> bookingsByObject.containsKey(obj.getId()))
                .toList();

        return buildOfficeStructure(withBookings, bookingsByObject, start, end);
    }
    //ПОИСК ВОЗМОЖНЫ ХМЕСТ ДЛЯ СОЗДАНИЕ БРОНИ АДМИНОМ ДЛЯ ЮЗЕРА
    public List<OfficeDto> findAvailableRoomsForAdmin(
            LocalDateTime start,
            LocalDateTime end,
            String office,
            Byte floor,
            Objects.Type type
    ) {
        List<Objects.Type> types = (type != null)
                ? List.of(type)
                : List.of(Objects.Type.values());

        List<Objects> objects = roomRep.findAvailableRoomsAdmin(
                types, start, end, office, floor
        );

        Map<Long, List<Bookings>> bookingsByObject;
        if (objects.isEmpty()) {
            bookingsByObject = Map.of();
        } else {
            List<Long> objectIds = objects.stream().map(Objects::getId).toList();
            bookingsByObject = bookingRep
                    .findBookingsForObjects(objectIds, start, end)
                    .stream()
                    .collect(Collectors.groupingBy(b -> b.getObject().getId()));
        }

        return buildOfficeStructure(objects, bookingsByObject, start, end);
    }


}