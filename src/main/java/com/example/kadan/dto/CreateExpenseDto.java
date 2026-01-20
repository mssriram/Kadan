package com.example.kadan.dto;

import com.example.kadan.dto.enums.SplitType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateExpenseDto(
        @NotBlank(message = "Amount is required")
        @Min(value = 0, message = "Amount must be greater than zero")
        BigDecimal amount,
        @NotBlank(message = "Date is required")
        @JsonFormat(pattern = "MM-dd-yyyy")
        LocalDate date,
        String currency,
        String description,
        @NotBlank(message = "PaidBy is required")
        UUID paidBy,
        @NotNull(message = "SplitType is required")
        SplitType splitType,
        @NotEmpty(message = "At least one member must be specified")
        @Valid
        List<MemberSplitDto> members
) {
}
