package Bookings.DTO;

import Bookings.Model.RoomLoad;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FloorDto {

    private Long id;
    private int num;
    private Integer totalPlaces;
    private Integer bookedPlaces;
    private RoomLoad load;   // ← было String, должно быть RoomLoad
    private List<RoomDto> rooms = new ArrayList<>();
}