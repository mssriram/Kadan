package com.example.kadan.validator;

import com.example.kadan.dto.CreateExpenseDto;
import com.example.kadan.dto.MemberSplitDto;
import com.example.kadan.dto.UpdateExpenseDto;
import com.example.kadan.dto.enums.SplitType;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Component
public class ExpenseValidator {

    public static void validateCreateExpense(CreateExpenseDto request) {
        validateAmount(request.amount());
        validateShareBigDecimal(request.members());
        validateNoDuplicateMembers(request.members());
        validateSplitType(request.splitType(), request.members(), request.amount());
    }

    public static void validateUpdateExpense(UpdateExpenseDto request) {
        //validates only if all three fields are provided
        if (ObjectUtils.allNotNull(request.splitType(), request.members(), request.amount())) {
            validateAmount(request.amount());
            validateShareBigDecimal(request.members());
            validateNoDuplicateMembers(request.members());
            validateSplitType(request.splitType(), request.members(), request.amount());
        } else if (ObjectUtils.anyNotNull(request.splitType(), request.members(), request.amount())) {
            throw new IllegalArgumentException("For updating expense, splitType, members and amount must all be provided");
        }
    }

    private static void validateAmount(BigDecimal amount) {
        if (amount.scale() > 2) {
            throw new IllegalArgumentException("Amount cannot have more than 2 decimal places");
        }
    }

    private static void validateShareBigDecimal(List<MemberSplitDto> members) {
        for (MemberSplitDto member : members) {
            if (member.share() != null && member.share().scale() > 2) {
                throw new IllegalArgumentException("Member share cannot have more than 2 decimal places: " + member.id());
            }
        }
    }

    private static void validateNoDuplicateMembers(List<MemberSplitDto> members) {
        Set<UUID> uniqueIds = new HashSet<>();

        for (MemberSplitDto member : members) {
            if (!uniqueIds.add(member.id())) {
                throw new IllegalArgumentException("Duplicate user found in expense split: " + member.id());
            }
        }
    }

    private static void validateSplitType(SplitType splitType, List<MemberSplitDto> members, BigDecimal totalAmount) {
        switch (splitType) {
            case EQUAL -> {
            }
            case EXACT -> validateExactSplit(members, totalAmount);
            case PERCENTAGE -> validatePercentageSplit(members);
            default -> throw new IllegalArgumentException("Invalid split type: " + splitType);
        }
    }

    private static void validateExactSplit(List<MemberSplitDto> members, BigDecimal amount) {
        BigDecimal sum = BigDecimal.ZERO;
        for (MemberSplitDto member : members) {
            if (Objects.isNull(member.share())) {
                throw new IllegalArgumentException("share must be provided for EXACT split type");
            }
            sum = sum.add(member.share());
        }

        if (!sum.equals(amount)) {
            throw new IllegalArgumentException(String.format("EXACT split shares (%.2f) must sum to total amount (%.2f)", sum, amount));
        }
    }

    private static void validatePercentageSplit(List<MemberSplitDto> members) {
        BigDecimal sum = BigDecimal.ZERO;
        for (MemberSplitDto member : members) {
            if (Objects.isNull(member.share())) {
                throw new IllegalArgumentException("value must be provided for PERCENTAGE split type");
            }
            sum = sum.add(member.share());
        }

        if (sum.compareTo(new BigDecimal(100)) != 0) {
            throw new IllegalArgumentException(String.format("PERCENTAGE shares (%.2f) must sum to 100", sum));
        }
    }
}

