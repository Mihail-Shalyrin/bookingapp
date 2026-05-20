package Bookings.Controller;

import Bookings.DTO.OfficeDto;
import Bookings.Model.Objects;
import Bookings.Model.Users;
import Bookings.Service.StructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final StructureService structureService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public List<OfficeDto> myReservations(
            @AuthenticationPrincipal Users user,
            @RequestParam(value = "office", required = false) String office,
            @RequestParam(value = "floor", required = false) Byte floor,
            @RequestParam(value = "type", required = false) Objects.Type type
    ) {
        return structureService.getMyReservedObjects(user, office, floor, type);
    }
}