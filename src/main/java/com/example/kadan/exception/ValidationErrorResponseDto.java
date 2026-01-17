package com.example.kadan.exception;

import java.util.Map;

public record ValidationErrorResponseDto(
        String type,
        Map<String, String> invalidFields
) {
}
