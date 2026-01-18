package com.example.kadan.exception;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    public static final String VALIDATION = "VALIDATION_ERROR";
    public static final String INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
    public ResponseEntity<ValidationErrorResponseDto> handleValidationException(Exception ex) {
        switch (ex) {
            case IllegalArgumentException illegalArgEx -> {
                log.info(illegalArgEx.getMessage());
                Map<String, String> message = Map.of("error", illegalArgEx.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ValidationErrorResponseDto(VALIDATION, message));
            }
            case MethodArgumentNotValidException methodArgEx -> {
                log.info("Validation failed: {}", methodArgEx.getMessage());
                Map<String, String> message = methodArgEx.getBindingResult().getFieldErrors().stream()
                        .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ValidationErrorResponseDto(VALIDATION, message));
            }
            default -> throw new RuntimeException("Unexpected value: " + ex);
        }
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleEntityNotFoundException(EntityNotFoundException ex) {
        log.info(ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDto(INTERNAL_SERVER_ERROR, "An unexpected error occurred"));
    }
}

