package com.example.kadan.expense;

import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class EqualCalculation implements ExpenseCalculationStrategy {

    public static final BigDecimal CENT = BigDecimal.valueOf(0.01);

    @Override
    public SplitType getSplitType() {
        return SplitType.EQUAL;
    }

    @Override
    public Map<User, BigDecimal> calculateExpense(Expense expense, Map<User, BigDecimal> memberSplitDto) {
        BigDecimal memberCount = BigDecimal.valueOf(memberSplitDto.size());
        BigDecimal amountInCents = expense.getAmount().multiply(BigDecimal.valueOf(100));

        BigDecimal[] split = amountInCents.divideAndRemainder(memberCount);
        BigDecimal splitBaseAmount = split[0].multiply(CENT);

        if (split[1].compareTo(BigDecimal.ZERO) == 0) {
            return memberSplitDto.keySet().stream().collect(Collectors.toMap(user -> user, _ -> splitBaseAmount));
        }

        Map<User, BigDecimal> memberSplits = new HashMap<>();
        for (User user: memberSplitDto.keySet()) {
            if (user.getId().equals(expense.getPaidBy().getId())) {
                memberSplits.put(user, splitBaseAmount.add(CENT.multiply(split[1])));
            } else {
                memberSplits.put(user, splitBaseAmount);
            }
        }

        return memberSplits;
    }
}
