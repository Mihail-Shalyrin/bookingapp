package Bookings.Service;

import Bookings.DTO.CreateUserRequest;
import Bookings.DTO.UpdateUserRequest;
import Bookings.DTO.UserDto;
import Bookings.Model.Roles;
import Bookings.Model.Users;
import Bookings.Repository.RolesRepository;
import Bookings.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RolesRepository rolesRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDto> searchUsers(String name) {
        List<Users> users = (name != null && !name.isBlank())
                ? userRepository.searchUsersByName(name)
                : userRepository.findAllOrderedByUsername();

        return users.stream()
                .map(UserDto::from)
                .toList();
    }

    public UserDto getById(Long id) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        return UserDto.from(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new ValidationException("Требуется username");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ValidationException("Требуется password");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Пользователь с таким именем уже существует");
        }

        Users user = new Users();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setLastname(request.getLastname());
        user.setAddress(request.getAddress());

        List<Roles> roles = resolveRoles(request.getRoles());
        if (roles.isEmpty()) {
            roles = new ArrayList<>(List.of(loadRole("USER")));
        }
        user.setRoles(roles);

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));

        if (request.getLastname() != null) user.setLastname(request.getLastname());
        if (request.getAddress()  != null) user.setAddress(request.getAddress());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(new ArrayList<>(resolveRoles(request.getRoles())));
        }

        return UserDto.from(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(long id, Users currentUser) {
        if (currentUser.getId() == id) {
            throw new ValidationException("Нельзя удалить самого себя");
        }
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Пользователь не найден"));
        userRepository.delete(user);
    }


    private List<Roles> resolveRoles(List<String> roleNames) {
        if (roleNames == null) return List.of();
        return roleNames.stream()
                .map(this::loadRole)
                .toList();
    }

    private Roles loadRole(String name) {
        Roles.Role roleEnum;
        try {
            roleEnum = Roles.Role.valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Неизвестная роль: " + name);
        }
        return rolesRepository.findByRole(roleEnum)
                .orElseThrow(() -> new ValidationException(
                        "Роль " + name + " не найдена в БД"
                ));
    }
}