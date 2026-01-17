package com.example.kadan.exception;

import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthExceptionHandler {

    public static final String ERROR_TYPE = "AUTHENTICATION_ERROR";

    @ExceptionHandler({BadCredentialsException.class})
    public ResponseEntity<ErrorResponseDto> handleAuthenticationException(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponseDto(ERROR_TYPE, "Invalid username or password"));
    }

    @ExceptionHandler({AuthenticationException.class})
    public ResponseEntity<ErrorResponseDto> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponseDto(ERROR_TYPE, "Authentication failed"));
    }

    @ExceptionHandler({JwtException.class})
    public ResponseEntity<ErrorResponseDto> handleJwtException(JwtException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponseDto(ERROR_TYPE, "Invalid or expired JWT token"));
    }
}
