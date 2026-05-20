package Bookings.Model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.cglib.core.Local;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@Entity
@NoArgsConstructor(force = true)
//@RequiredArgsConstructor
public class Room implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String number;
    @ManyToOne
    private Floor floor;


}
