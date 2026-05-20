package Bookings.DTO;

import Bookings.Model.Users;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String lastname;
    private String address;
    private List<String> roles;

    public static UserDto from(Users u) {
        List<String> roleNames = (u.getRoles() == null)
                ? List.of()
                : u.getRoles().stream()
                .map(r -> r.getRole().name())
                .toList();

        return new UserDto(
                u.getId(),
                u.getUsername(),
                u.getLastname(),
                u.getAddress(),
                roleNames
        );
    }
}