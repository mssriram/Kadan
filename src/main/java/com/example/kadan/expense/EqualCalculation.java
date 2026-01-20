package com.example.kadan.expense;

import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.ExpenseSplit;
import com.example.kadan.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class EqualCalculation implements ExpenseCalculationStrategy {

    @Override
    public SplitType getSplitType() {
        return SplitType.EQUAL;
    }

    @Override
    public Map<User, BigDecimal> calculateExpense(Expense expense, Map<User, BigDecimal> memberSplitDto) {
        BigDecimal memberCount = BigDecimal.valueOf(memberSplitDto.size());
        BigDecimal splitAmount = expense.getAmount().divide(memberCount, 2, RoundingMode.DOWN);

        return memberSplitDto.keySet().stream().collect(Collectors.toMap(user -> user, _ -> splitAmount));
    }
}
