package com.example.kadan.dto;

import com.example.kadan.entity.ExpenseSplit;

import java.math.BigDecimal;
import java.util.UUID;

public record MemberSplitResponseDto(
        UUID id,
        UUID user_id,
        String name,
        BigDecimal amount,
        boolean isSettled
) {
    static MemberSplitResponseDto fromEntity(ExpenseSplit split) {
        return new MemberSplitResponseDto(
                split.getId(),
                split.getUser().getId(),
                split.getUser().getDisplayName(),
                split.getAmount(),
                split.getIsSettled());
    }
}
