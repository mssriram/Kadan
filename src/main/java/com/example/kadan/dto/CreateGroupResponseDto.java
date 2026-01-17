package com.example.kadan.dto;

import com.example.kadan.entity.Group;
import com.example.kadan.entity.User;

import java.util.List;
import java.util.UUID;

public record CreateGroupResponseDto(
        UUID groupId,
        String name,
        String description,
        String currency,
        boolean simplifyDebts,
        UserProfileDto createdBy,
        List<UserProfileDto> members
) {
    public static CreateGroupResponseDto fromEntity(Group group, List<User> members) {
        List<UserProfileDto> membersList = members.stream().map(UserProfileDto::fromEntity).toList();
        return new CreateGroupResponseDto(group.getId(), group.getName(), group.getDescription(), group.getCurrency(), group.isSimplifyDebts(), UserProfileDto.fromEntity(group.getCreatedBy()), membersList);
    }
}
