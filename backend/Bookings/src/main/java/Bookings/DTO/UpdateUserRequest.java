package Bookings.DTO;

import lombok.Data;
import java.util.List;

@Data
public class UpdateUserRequest {
    private String password;
    private String lastname;
    private String address;
    private String office;
    private List<String> roles;
}