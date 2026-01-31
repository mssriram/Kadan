package com.example.kadan.dto;

import com.example.kadan.entity.GroupMember;

public record GroupMemberResponseDto(
        String id,
        String email,
        String displayName,
        String role
) {
    public static GroupMemberResponseDto fromEntity(GroupMember dto) {
        return new GroupMemberResponseDto(
                dto.getId().toString(),
                dto.getUser().getEmail(),
                dto.getUser().getDisplayName(),
                dto.getRole().name()
        );
    }
}
