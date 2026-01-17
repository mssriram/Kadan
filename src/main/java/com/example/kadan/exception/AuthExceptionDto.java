package com.example.kadan.exception;

public record AuthExceptionDto(
        String type,
        String message
) {
}
