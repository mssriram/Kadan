package com.example.kadan.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record GroupDto(
        @NotBlank(message = "Name must not be blank")
        String name,
        String description,
        Boolean simplifyDebts,
        @Size(min = 3, max = 3, message = "Currency must be a 3-letter code")
        String currency,
        List<String> members
) {
}
