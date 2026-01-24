package com.example.kadan.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginUserDto(
        @NotBlank(message = "Email cannot be blank")
        String email,
        @NotBlank(message = "Password cannot be blank")
        String password
) {
}
