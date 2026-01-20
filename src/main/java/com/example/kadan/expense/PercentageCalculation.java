package com.example.kadan.expense;

import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.ExpenseSplit;
import com.example.kadan.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;

@Component
public class PercentageCalculation implements ExpenseCalculationStrategy {

    @Override
    public SplitType getSplitType() {
        return SplitType.PERCENTAGE;
    }

    @Override
    public List<ExpenseSplit> calculateExpense(Expense amount, Map<User, BigDecimal> memberSplitDto) {
        return memberSplitDto.entrySet().stream().map(entry -> {
            BigDecimal percentage = entry.getValue();
            BigDecimal splitAmount = amount.getAmount().multiply(percentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.DOWN);

            return ExpenseSplit.builder()
                    .expense(amount)
                    .user(entry.getKey())
                    .amount(splitAmount)
                    .isSettled(false)
                    .build();
        }).toList();
    }
}
