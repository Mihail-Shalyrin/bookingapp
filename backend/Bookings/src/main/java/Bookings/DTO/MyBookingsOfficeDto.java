package Bookings.DTO;

import lombok.Data;

import java.util.List;

@Data
public class MyBookingsOfficeDto {
    private Long id;
    private String city;
    private String department;
    private List<MyBookingsFloorDto> floors;
}