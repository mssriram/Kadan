package com.example.kadan.dto;

import com.example.kadan.dto.enums.UserStatus;
import com.example.kadan.entity.User;

public record UserProfileDto(
        String id,
        String email,
        String displayName,
        String defaultCurrency,
        UserStatus status
) {
    public static UserProfileDto fromEntity(User user) {
        return new UserProfileDto(
                user.getId().toString(),
                user.getEmail(),
                user.getDisplayName(),
                user.getDefaultCurrency(),
                user.getStatus()
        );
    }
}
