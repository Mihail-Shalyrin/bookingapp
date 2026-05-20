package Bookings.DTO;

import Bookings.Model.RoomLoad;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

//@Data
//@NoArgsConstructor
//@AllArgsConstructor
//public class RoomDto {
//
//    private Long id;
//    private String number;
//    private List<ObjectDto> objects = new ArrayList<>();
//}
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomDto {

    private Long id;
    private String number;

    private Integer totalPlaces;
    private Integer bookedPlaces;

    private RoomLoad load;

    private List<ObjectDto> objects =
            new ArrayList<>();
}