package com.example.kadan.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterUserDto(
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 255, message = "Email can be at most 255 characters long")
        String email,

        @NotBlank
        @Size(max = 100, message = "Display name can be at most 100 characters long")
        String displayName,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 20, message = "Password must be 8-20 characters long")
        String password
) {
}

