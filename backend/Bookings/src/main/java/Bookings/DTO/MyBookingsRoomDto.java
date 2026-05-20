package Bookings.DTO;

import lombok.Data;

import java.util.List;

@Data
public class MyBookingsRoomDto {
    private Long id;
    private String number;
    private List<MyBookingDto> bookings;
}

