package Bookings.DTO;

import Bookings.Model.Objects;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ObjectDto {

    private Long id;
    private String name;
    private String spot;
    private Objects.Type type;
    private List<BookingInfoDto> bookings;


}