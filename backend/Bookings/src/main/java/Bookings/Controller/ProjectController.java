package Bookings.Controller;

import Bookings.DTO.OfficeDto;
import Bookings.DTO.ProjectDto;
import Bookings.DTO.UserShortDto;
import Bookings.Model.Objects;
import Bookings.Model.Users;
import Bookings.Service.ProjectService;
import Bookings.Service.StructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final StructureService structureService;

    // список проектов пользователя + поиск по имени
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public List<ProjectDto> myProjects(
            @AuthenticationPrincipal Users user,
            @RequestParam(required = false) String name
    ) {
        return projectService.getMyProjects(user, name);
    }

    @GetMapping("/{projectId}/rooms")
    @PreAuthorize("hasRole('USER')")
    public List<OfficeDto> projectRooms(
            @AuthenticationPrincipal Users user,
            @PathVariable Long projectId
    ) {
        return structureService.getProjectRooms(user, projectId);
    }
    @GetMapping("/{projectId}/users")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<UserShortDto>> getProjectUsers(
            @PathVariable Long projectId,
            @RequestParam(required = false) String name
    ) {
        return ResponseEntity.ok(projectService.getProjectUsers(projectId, name));
    }

    @GetMapping("/{projectId}/rooms/filter")
    @PreAuthorize("hasRole('USER')")
    public List<OfficeDto> projectRoomsByPeriod(
            @AuthenticationPrincipal Users user,
            @PathVariable Long projectId,
            @RequestParam("start")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(value = "type", required = false) Objects.Type type,
            @RequestParam(value = "office", required = false) String office,
            @RequestParam(value = "floor", required = false) Byte floor
    ) {
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("начало должно быть раньше конца");
        }
        return structureService.findProjectRoomsByPeriod(
                user, projectId, start, end, office, floor, type
        );
    }

    @GetMapping("/{projectId}/rooms/{objectId}")
    @PreAuthorize("hasRole('USER')")
    public List<OfficeDto> projectObject(
            @AuthenticationPrincipal Users user,
            @PathVariable Long projectId,
            @PathVariable Long objectId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return structureService.getProjectObjectById(user, projectId, objectId, date);
    }
}