package com.example.kadan.dto;

import com.example.kadan.expense.Debt;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BalanceResponseDto(
        List<MemberBalanceDto> balances,
        List<Debt> debts
) {
    public boolean doesMemberHaveBalance(UUID memberId) {
        return balances.stream().anyMatch(balance -> balance.id().equals(memberId) && balance.netBalance().compareTo(BigDecimal.ZERO) != 0);
    }
}
