package Bookings.DTO;

import Bookings.Model.BookingMode;
import Bookings.Model.Objects;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MyBookingDto {
    private Long bookingId;
    private Long objectId;
    private String objectName;     // место/спот
    private String spot;
    private Objects.Type type;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingMode bookingMode;
}