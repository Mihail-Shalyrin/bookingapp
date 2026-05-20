package Bookings.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OfficeDto {

    private Long id;
    private String city;
    private String department;
    private List<FloorDto> floors = new ArrayList<>();
}