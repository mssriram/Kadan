package com.example.kadan.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginUserDto(
        @NotBlank
        String username,
        @NotBlank
        String password,
        String token
) {
}
