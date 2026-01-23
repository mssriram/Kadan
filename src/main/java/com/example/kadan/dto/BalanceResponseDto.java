package com.example.kadan.dto;

import com.example.kadan.expense.Debt;

import java.util.List;

public record BalanceResponseDto(
        List<MemberBalanceDto> balances,
        List<Debt> debts
) {
}
