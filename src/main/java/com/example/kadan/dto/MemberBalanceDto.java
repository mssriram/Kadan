package com.example.kadan.dto;

import com.example.kadan.entity.User;
import com.example.kadan.repository.ExpenseSplitRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record MemberBalanceDto(
        UUID id,
        String name,
        BigDecimal paid,
        BigDecimal owed,
        BigDecimal netBalance
) {
    public static List<MemberBalanceDto> from(List<User> members, Map<UUID, ExpenseSplitRepository.GroupBalance> memberIds) {
        return members.stream()
                .map(member -> {
                    ExpenseSplitRepository.GroupBalance balance = memberIds.get(member.getId());
                    BigDecimal paid = balance != null ? balance.getTotalPaid() : BigDecimal.ZERO;
                    BigDecimal owed = balance != null ? balance.getTotalOwed() : BigDecimal.ZERO;
                    BigDecimal netBalance = balance != null ? balance.getNetBalance() : BigDecimal.ZERO;
                    return new MemberBalanceDto(
                            member.getId(),
                            member.getDisplayName(),
                            paid,
                            owed,
                            netBalance
                    );
                })
                .toList();
    }
}
