package com.example.kadan.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record MemberSplitDto(
    @NotNull(message = "id is required")
    UUID id,
    @Min(value = 0)
    BigDecimal share  // null for EQUAL, amount for EXACT, percentage for PERCENTAGE
) {
}
