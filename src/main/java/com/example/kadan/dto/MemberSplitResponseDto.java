package com.example.kadan.dto;

import com.example.kadan.entity.ExpenseSplit;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
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
