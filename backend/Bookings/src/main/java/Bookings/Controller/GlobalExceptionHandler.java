package Bookings.Controller;

import Bookings.DTO.ErrorResponse;
import Bookings.Service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(BookingValidationException.class)
    public ResponseEntity<ErrorResponse> handleBookingValidation(BookingValidationException e) {
        return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Void> handleNotFound(NotFoundException e) {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<Void> handleBookingNotFound(BookingNotFoundException e) {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(BookingAccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(BookingAccessDeniedException e) {
        return ResponseEntity.status(403).body(new ErrorResponse(e.getMessage()));
    }
}

