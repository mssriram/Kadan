package com.example.kadan.dto;

import com.example.kadan.entity.Group;

import java.util.UUID;

public record CreateGroupResponseDto(
        UUID groupId,
        String name,
        String description,
        String currency,
        boolean simplifyDebts,
        UserProfileDto createdBy
) {
    public static CreateGroupResponseDto fromEntity(Group group) {
        return new CreateGroupResponseDto(group.getId(), group.getName(), group.getDescription(), group.getCurrency(), group.isSimplifyDebts(), UserProfileDto.fromEntity(group.getCreatedBy()));
    }
}
