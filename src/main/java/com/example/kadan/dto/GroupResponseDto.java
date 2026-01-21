package com.example.kadan.dto;

import com.example.kadan.entity.Group;

import java.util.List;
import java.util.UUID;

public record GroupResponseDto(
        UUID id,
        String name,
        String description,
        String currency,
        UserProfileDto created_by,
        List<UserProfileDto> members
) {
    public static GroupResponseDto fromEntity(Group group) {
        return fromEntity(group, group.getMembers().stream()
                .map(UserProfileDto::fromEntity)
                .toList());
    }

    public static GroupResponseDto fromEntityWithoutMembers(Group group) {
        return fromEntity(group, List.of());
    }

    private static GroupResponseDto fromEntity(Group group, List<UserProfileDto> members) {
        return new GroupResponseDto(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getCurrency(),
                UserProfileDto.fromEntity(group.getCreatedBy()),
                members
        );
    }
}
