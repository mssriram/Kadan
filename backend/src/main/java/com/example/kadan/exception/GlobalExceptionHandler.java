package com.example.kadan.exception;

import jakarta.persistence.EntityNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import tools.jackson.databind.exc.InvalidFormatException;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    public static final String VALIDATION = "VALIDATION_ERROR";
    public static final String RESOURCE_CONFLICT = "RESOURCE_CONFLICT";
    public static final String INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
    public static final String DATE_FORMAT_VALIDATION_ERROR = "Date should be in the format MM-DD-YYYY";

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    public ResponseEntity<ValidationErrorResponseDto> handleValidationException(Exception ex) {
        switch (ex) {
            case IllegalArgumentException illegalArgEx -> {
                log.info("Validation failed: {}", illegalArgEx.getMessage());
                Map<String, String> message = Map.of("error", illegalArgEx.getMessage());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(new ValidationErrorResponseDto(VALIDATION, message));
            }
            case MethodArgumentNotValidException methodArgEx -> {
                log.info("Validation failed: {}", methodArgEx.getMessage());
                Map<String, String> message = methodArgEx.getBindingResult().getFieldErrors().stream()
                        .collect(Collectors.toMap(FieldError::getField, FieldError::getDefaultMessage));

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ValidationErrorResponseDto(VALIDATION, message));
            }
            case HttpMessageNotReadableException dateTimeEx -> {
                if (dateTimeEx.getCause() instanceof InvalidFormatException) {
                    log.info("Validation failed: {}", dateTimeEx.getMessage());
                    Map<String, String> message = Map.of("error", DATE_FORMAT_VALIDATION_ERROR);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ValidationErrorResponseDto(VALIDATION, message));
                } else {
                    throw dateTimeEx;
                }
            }
            default -> throw new RuntimeException("Unexpected value: " + ex);
        }
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleEntityNotFoundException(EntityNotFoundException ex) {
        log.info("EntityNotFoundException : {} ",ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponseDto> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        log.info("DataIntegrityViolationException : {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGenericException(Exception ex) {
        log.info("Unknown exception occurred: {}", ex.getMessage());
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponseDto(INTERNAL_SERVER_ERROR, "An unexpected error occurred"));
    }
}

