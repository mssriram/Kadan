package com.example.kadan.dto;

public record UpdateGroupDto(
        String name,
        String description,
        Boolean simplifyDebts,
        String currency
) {
}
