package Bookings.Controller;

import Bookings.DTO.OfficeDto;
import Bookings.Model.Objects;
import Bookings.Model.Users;
import Bookings.Repository.ObjectRepository;
import Bookings.Service.StructureService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/main")
public class MainPageController {

    private final ObjectRepository roomRep;
    private final StructureService structureService;
    public MainPageController(ObjectRepository roomRep, StructureService structureService) {
        this.structureService = structureService;
        this.roomRep = roomRep;
    }



private List<Objects.Type> getAllowedTypes(Users user) {
    if (user.hasRole("ADMIN") || user.hasRole("SUPERADMIN")) {
        return List.of(Objects.Type.values());
    }
    return List.of(Objects.Type.ROOM, Objects.Type.MEETING);
}


@GetMapping("/rooms")
@PreAuthorize("hasRole('USER')")
public List<OfficeDto> getAvailableRooms1(
        @AuthenticationPrincipal Users user
) {
    return structureService.getAvailableRooms(user);
}


    @GetMapping("/rooms/filter")
    @PreAuthorize("hasRole('USER')")
    public List<OfficeDto> getAvailableRoomsByPeriod(
            @AuthenticationPrincipal Users user,
            @RequestParam("start")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime start,
            @RequestParam("end")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime end,
            @RequestParam(value = "type", required = false)
            Objects.Type type,
            @RequestParam(value = "office", required = false)
            String office,
            @RequestParam(value = "floor", required = false)
            Byte floor
    ) {

        if (!end.isAfter(start)) {
            throw new IllegalArgumentException(
                    "начало должно быть раньше конца"
            );
        }

        List<Objects.Type> allowedTypes =
                getAllowedTypes(user);

        if (type != null) {

            if (!allowedTypes.contains(type)) {
                throw new IllegalArgumentException(
                        "эта комната недоступна для вашей роли"
                );
            }

        }

        return structureService.findAvailableRooms(
                user,
                start,
                end,
                office,
                floor,
                type
        );
    }

    @GetMapping("/rooms/{objectId}")
    @PreAuthorize("hasRole('USER')")
    public List<OfficeDto> getObject(
            @AuthenticationPrincipal Users user,
            @PathVariable Long objectId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return structureService.getObjectById(user, objectId, date);
    }

}
