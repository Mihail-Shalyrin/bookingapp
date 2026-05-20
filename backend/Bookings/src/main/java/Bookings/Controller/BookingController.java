package Bookings.Controller;

import Bookings.DTO.BookingRequest;
import Bookings.DTO.BookingResponse;
import Bookings.DTO.ErrorResponse;
import Bookings.DTO.MyBookingsOfficeDto;
import Bookings.Model.Bookings;
import Bookings.Model.Users;
import Bookings.Service.BookingAccessDeniedException;
import Bookings.Service.BookingNotFoundException;
import Bookings.Service.BookingService;
import Bookings.Service.BookingValidationException;
import Bookings.Service.StructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final StructureService structureService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request,
                                           @AuthenticationPrincipal Users user) {
        try {
            List<Bookings> saved = bookingService.createBooking(request, user);

            Object body = (saved.size() == 1)
                    ? BookingResponse.from(saved.get(0))
                    : saved.stream().map(BookingResponse::from).toList();

            return ResponseEntity.status(HttpStatus.CREATED).body(body);

        } catch (BookingValidationException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public List<MyBookingsOfficeDto> myBookings(@AuthenticationPrincipal Users user) {
        return structureService.getMyBookings(user);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id,
                                           @AuthenticationPrincipal Users user) {
        try {
            bookingService.deleteBooking(id, user);
            return ResponseEntity.noContent().build();
        } catch (BookingNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (BookingAccessDeniedException e) {
            return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
        }
    }

}