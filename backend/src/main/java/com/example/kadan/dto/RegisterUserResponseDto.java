package com.example.kadan.dto;

import com.example.kadan.dto.enums.UserStatus;

public record RegisterUserResponseDto(
        String id,
        String email,
        String displayName,
        String defaultCurrency,
        UserStatus status
) {
}
