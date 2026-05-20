package Bookings.DTO;

import lombok.Data;

import java.util.List;

@Data

public class MyBookingsFloorDto {
    private Long id;
    private Integer num;
    private List<MyBookingsRoomDto> rooms;
}
