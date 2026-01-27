package com.example.kadan.dto;

import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ExpenseDto(
        UUID id,
        String currency,
        String description,
        BigDecimal amount,
        LocalDate date,
        SplitType splitType,
        UserProfileDto paidBy,
        List<MemberSplitResponseDto> shares,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
    public static ExpenseDto fromEntity(Expense expense) {
        return new ExpenseDto(
                expense.getId(),
                expense.getCurrency(),
                expense.getDescription(),
                expense.getAmount(),
                expense.getExpenseDate(),
                expense.getSplitType(),
                UserProfileDto.fromEntity(expense.getPaidBy()),
                expense.getExpenseSplits().stream()
                        .map(MemberSplitResponseDto::fromEntity)
                        .toList(),
                expense.getCreatedAt(),
                expense.getUpdatedAt()
        );
    }
}
