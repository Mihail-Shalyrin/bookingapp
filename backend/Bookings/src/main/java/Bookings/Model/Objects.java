package Bookings.Model;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@NoArgsConstructor( force=true)
@RequiredArgsConstructor
public class Objects {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long id;
    private final String name;
    @Enumerated(EnumType.STRING)
    private final Type type;
    private  final String spot;
    @OneToMany(mappedBy = "object")
    private List<Bookings> bookings = new ArrayList<>();
    @ManyToOne
    private Users reservedForUser;
    @ManyToOne
    private Project reservedForProject;
   @ManyToOne
   private  Room room;
    public enum Type{ROOM,MEETING,HALL}
}
