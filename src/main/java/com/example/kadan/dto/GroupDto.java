package com.example.kadan.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record GroupDto(
        @NotBlank(message = "Name must not be blank")
        String name,
        String description,
        Boolean simplifyDebts,
        String currency,
        List<String> memberUsernames
) {
}
