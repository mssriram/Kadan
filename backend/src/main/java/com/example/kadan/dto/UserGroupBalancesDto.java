package com.example.kadan.dto;

import com.example.kadan.repository.ExpenseSplitRepository;

import java.math.BigDecimal;
import java.util.UUID;

public record UserGroupBalancesDto(
        UUID groupId,
        String groupName,
        BigDecimal paid,
        BigDecimal owed,
        BigDecimal netBalance
) {
    public static UserGroupBalancesDto fromEntity(ExpenseSplitRepository.UserGroupBalance entity) {
        return new UserGroupBalancesDto(
                entity.getGroupId(),
                entity.getGroupName(),
                entity.getTotalPaid(),
                entity.getTotalOwed(),
                entity.getNetBalance()
        );
    }
}
