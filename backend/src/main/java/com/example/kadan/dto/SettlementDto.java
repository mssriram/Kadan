package com.example.kadan.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.UUID;

public record SettlementDto(
        @NotNull(message = "creditor Id cannot be null")
        UUID creditor_id,
        @NotNull(message = "debtor Id cannot be null")
        @Min(value = 0, message = "amount must be greater than zero")
        BigDecimal amount,
        @Size(min = 3, max = 3, message = "currency must be a valid 3-letter ISO code")
        String currency
) {
}
