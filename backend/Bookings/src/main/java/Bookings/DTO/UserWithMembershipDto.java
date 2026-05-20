package Bookings.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class UserWithMembershipDto {
    private Long id;
    private String username;
    private String lastname;
    private boolean inProject;
}
