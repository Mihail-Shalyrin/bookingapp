package Bookings.Controller;

import Bookings.DTO.*;
import Bookings.Model.Bookings;
import Bookings.Model.Objects;
import Bookings.Model.Project;
import Bookings.Model.UserProject;
import Bookings.Model.Users;
import Bookings.Repository.ObjectRepository;
import Bookings.Repository.UserRepository;
import Bookings.Service.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import Bookings.DTO.UserDto;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")

public class AdminController {

    private final ReservationService reservationService;
    private final ProjectService projectService;
    private final BookingService bookingService;
   private final ObjectRepository objectRepository;
   private final UserRepository userRepository;
    private final StructureService structureService;
    private final UserService userService;
    public AdminController( ReservationService reservationService,
 ProjectService projectService,
     BookingService bookingService,
 ObjectRepository objectRepository,
UserRepository userRepository,
   StructureService structureService,
                            UserService userService)
    {
        this.userService = userService;
        this.projectService = projectService;
                this.bookingService = bookingService;
                this.objectRepository = objectRepository;
                this.userRepository = userRepository;
                this.structureService = structureService;
                this.reservationService = reservationService;

    }


    @GetMapping("/projects")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Project> getAllProjects(@RequestParam(required = false) String name)
    {
        return projectService.getAllProjects(name);
    }
    @GetMapping("/projects/{projectId}/reserved")
    public List<OfficeDto> getProjectReservedObjects(
            @PathVariable Long projectId,
            @RequestParam(value = "office", required = false) String office,
            @RequestParam(value = "floor",  required = false) Byte floor,
            @RequestParam(value = "type",   required = false) Objects.Type type
    ) {
        return reservationService.getReservedForProjects(projectId, office, floor, type);
    }


    @PostMapping("/reserve-project")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Objects> reservePlaceForProject(@RequestBody ReserveProjectSpot spot) {
        return ResponseEntity.ok(reservationService.reserveForProject(spot));
    }

    @GetMapping("/projects/{projectId}/users/search")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserShortDto> searchUsersForProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String name
    ) {
        return projectService.findUsersNotInProject(projectId, name);
    }
    //ДОБАВЛЕНИЕ ЧЕЛОВЕКА В ПРОЕКТ
    @PostMapping("/projects/users")
    public ResponseEntity<UserProject> addUserToProject(@RequestBody AddUserToProjectRequest request) {
        UserProject up = projectService.addUserToProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(up);
    }

    @GetMapping("/projects/{projectId}/available")
    @PreAuthorize("hasRole('ADMIN')")
    public List<OfficeDto> getAvailableForProject(
            @PathVariable Long projectId,
            @RequestParam(value = "office", required = false) String office,
            @RequestParam(value = "floor",  required = false) Byte floor,
            @RequestParam(value = "type",   required = false) Objects.Type type
    ) {
        return reservationService.getFreeForReservation(projectId, office, floor, type);
    }

    @DeleteMapping("/projects/{projectId}/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeUserFromProject(
            @PathVariable Long projectId,
            @PathVariable Long userId
    ) {
        projectService.removeUserFromProject(projectId, userId);
        return ResponseEntity.noContent().build();
    }



    @GetMapping("/users")
    public List<UserDto> getAllUsers(
            @RequestParam(required = false) String name
    ) {
        String nameFilter = (name != null && !name.isBlank()) ? name : null;
        return userService.searchUsers(nameFilter);
    }

    @GetMapping("/users/{userId}/reserved")
    public List<OfficeDto> getUserReservedObjects(
            @PathVariable Long userId,
            @RequestParam(value = "office", required = false) String office,
            @RequestParam(value = "floor",  required = false) Byte floor,
            @RequestParam(value = "type",   required = false) Objects.Type type
    ) {
        return reservationService.getReservedForUser(userId, office, floor, type);
    }
    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(@RequestBody CreateProjectRequest request) {
        Project project = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }
    @GetMapping("/users/{userId}/available")
    public List<OfficeDto> getAvailableForUser(
            @PathVariable Long userId,
            @RequestParam(value = "office", required = false) String office,
            @RequestParam(value = "floor",  required = false) Byte floor,
            @RequestParam(value = "type",   required = false) Objects.Type type
    ) {
        return reservationService.getFreeForUserReservation(userId, office, floor, type);
    }

    @PostMapping("/reserve")
    public ResponseEntity<Objects> reservePlace(@RequestBody ReserveSpot spot) {
        return ResponseEntity.ok(reservationService.reserveForUser(spot));
    }




@GetMapping("/users/{userId}/bookings")
public List<OfficeDto> getUserBookings(
        @PathVariable Long userId,
        @RequestParam(value = "date", required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(value = "office", required = false) String office,
        @RequestParam(value = "floor",  required = false) Byte floor,
        @RequestParam(value = "type",   required = false) Objects.Type type
) {
    LocalDateTime start = (date != null) ? date.atStartOfDay() : null;
    LocalDateTime end   = (date != null) ? date.atTime(LocalTime.MAX) : null;

    return structureService.getUserBookingsStructure(
            userId, start, end, office, floor, type
    );
}
    @GetMapping("/users/{userId}/available-rooms")
    public List<OfficeDto> getAvailableRoomsForUserBooking(
            @PathVariable Long userId,
            @RequestParam("start")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(value = "office", required = false) String office,
            @RequestParam(value = "floor",  required = false) Byte floor,
            @RequestParam(value = "type",   required = false) Objects.Type type
    ) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("начало должно быть раньше конца");
        }

        return structureService.findAvailableRoomsForUser(
                user, start, end, office, floor, type
        );
    }

    @PostMapping("/users/{userId}/bookings")
    public ResponseEntity<?> createBookingForUser(
            @PathVariable Long userId,
            @RequestBody BookingRequest request
    ) {
        List<Bookings> saved = bookingService.createBookingFor(request, userId);

        Object body = (saved.size() == 1)
                ? BookingResponse.from(saved.get(0))
                : saved.stream().map(BookingResponse::from).toList();

        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @DeleteMapping("/bookings/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBookingAsAdmin(id);
        return ResponseEntity.noContent().build();
    }



    @PutMapping("/unreserve/{objectId}")
    public ResponseEntity<Objects> unreservePlace(@PathVariable Long objectId) {
        return ResponseEntity.ok(reservationService.unreserve(objectId));
    }


}