package com.example.kadan.dto;

import com.example.kadan.entity.Settlement;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record SettlementResponseDto(
        UUID id,
        BigDecimal amount,
        String currency,
        LocalDate date,
        UUID creditor,
        UUID debtor
) {
    public static SettlementResponseDto fromEntity(Settlement settlement) {
        return new SettlementResponseDto(
                settlement.getId(),
                settlement.getAmount(),
                settlement.getCurrency(),
                settlement.getCreatedAt().toLocalDate(),
                settlement.getCreditor().getId(),
                settlement.getDebtor().getId()
        );
    }
}
