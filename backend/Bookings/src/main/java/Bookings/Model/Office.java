package Bookings.Model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;


@Data
@Entity
@NoArgsConstructor( force=true)
@RequiredArgsConstructor
public class Office {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long id;
    private final String city;
    private final String Department;


}
