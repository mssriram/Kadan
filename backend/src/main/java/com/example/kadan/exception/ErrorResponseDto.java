package com.example.kadan.exception;

public record ErrorResponseDto(
        String type,
        String message
) {
}
