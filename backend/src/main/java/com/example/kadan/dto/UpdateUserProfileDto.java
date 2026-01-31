package com.example.kadan.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileDto(
        @Email(message = "Invalid Email format")
        String email,

        @Size(max = 100, message = "Display name must not exceed 100 characters")
        String displayName,

        @Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
        String defaultCurrency
) {
}

