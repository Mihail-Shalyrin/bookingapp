package Bookings.Controller;

import Bookings.DTO.ErrorResponse;
import Bookings.DTO.MyBookingsOfficeDto;
import Bookings.Model.Bookings;
import Bookings.Model.Users;
import Bookings.Repository.BookingRepository;
import Bookings.Service.StructureService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class MyBookingsController {

    private final BookingRepository bookingRepository;
    private final StructureService structureService;
    public MyBookingsController(BookingRepository bookingRepository, StructureService structureService) {
        this.bookingRepository = bookingRepository;
        this.structureService = structureService;
    }


@GetMapping("/me")
@PreAuthorize("hasRole('USER')")
public List<MyBookingsOfficeDto> myBookings(@AuthenticationPrincipal Users user) {
    return structureService.getMyBookings(user);
}

    @PreAuthorize("hasRole('USER')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id,
                                           @AuthenticationPrincipal Users user) {

        Optional<Bookings> optionalBooking = bookingRepository.findById(id);

        if (optionalBooking.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Bookings booking = optionalBooking.get();

        boolean isOwner = booking.getUser().getId().equals(user.getId());
        boolean isAdmin = user.hasRole("ADMIN") || user.hasRole("SUPERADMIN");

        if (!isOwner && !isAdmin) {
            return ResponseEntity.status(403)
                    .body(new ErrorResponse("Вы не можете удалить эту бронь"));
        }

        bookingRepository.delete(booking);
        return ResponseEntity.noContent().build();
    }
}