package Bookings.Service;

public class BookingValidationException extends RuntimeException {
    public BookingValidationException(String message) {
        super(message);
    }
}
