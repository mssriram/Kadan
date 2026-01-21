package com.example.kadan.dto;

import com.example.kadan.dto.enums.SplitType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record UpdateExpenseDto(
        @Min(value = 0, message = "Amount must be greater than zero")
        BigDecimal amount,
        @JsonFormat(pattern = "MM-dd-uuuu")
        LocalDate date,
        String currency,
        @Size(min = 1, max = 500, message = "Description must be between 1 and 500 characters")
        String description,
        UUID paidBy,
        SplitType splitType,
        @Valid
        List<MemberSplitDto> members

) {
}
