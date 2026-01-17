package com.example.kadan.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.naming.AuthenticationException;

@RestControllerAdvice
public class AuthExceptionHandler extends ResponseEntityExceptionHandler {

    public static final String ERROR_TYPE = "AUTHENTICATION_ERROR";

    @ExceptionHandler({BadCredentialsException.class})
    public ResponseEntity<AuthExceptionDto> handleAuthenticationException(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthExceptionDto(ERROR_TYPE, "Invalid username or password"));
    }

    @ExceptionHandler({AuthenticationException.class})
    public ResponseEntity<AuthExceptionDto> handleAuthenticationException(AuthenticationException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthExceptionDto(ERROR_TYPE, "Authentication failed"));
    }
}
