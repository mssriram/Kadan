package com.example.kadan.dto.enums;

import jakarta.persistence.AttributeConverter;

public enum GroupStatus implements AttributeConverter<Boolean, GroupStatus> {
    ACTIVE,
    DELETED;

    @Override
    public GroupStatus convertToDatabaseColumn(Boolean attribute) {
        return attribute ? ACTIVE : DELETED;
    }

    @Override
    public Boolean convertToEntityAttribute(GroupStatus status) {
        return status == ACTIVE;
    }
}
