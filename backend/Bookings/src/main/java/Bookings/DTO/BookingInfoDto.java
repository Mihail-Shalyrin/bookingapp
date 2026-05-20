package Bookings.DTO;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingInfoDto {
    private Long bookingId;
    private Long userId;
    private String username;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}