package Bookings.Controller;

import Bookings.DTO.CreateProjectRequest;
import Bookings.DTO.CreateUserRequest;
import Bookings.DTO.UpdateUserRequest;
import Bookings.DTO.UserDto;
import Bookings.Model.Project;
import Bookings.Model.Users;
import Bookings.Service.ProjectService;
import Bookings.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/superadmin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPERADMIN')")
public class SuperAdminController {
    private final ProjectService projectService;
    private final UserService userService;
    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(@RequestBody CreateProjectRequest request) {
        Project project = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }
    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/users")
    public List<UserDto> getAllUsers(@RequestParam(required = false) String name) {
        return userService.searchUsers(name);
    }

    @GetMapping("/users/{id}")
    public UserDto getUserById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PostMapping("/users")
    public ResponseEntity<UserDto> createUser(@RequestBody CreateUserRequest request) {
        UserDto created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/users/{id}")
    public UserDto updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request
    ) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal Users currentUser
    ) {
        userService.deleteUser(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}