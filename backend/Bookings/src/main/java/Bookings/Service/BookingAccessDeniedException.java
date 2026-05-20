package Bookings.Service;

public class BookingAccessDeniedException extends RuntimeException {
    public BookingAccessDeniedException(String message) {
        super(message);
    }
}
