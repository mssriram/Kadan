package com.example.kadan.expense;

import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
public class PercentageCalculation implements ExpenseCalculationStrategy {

    public static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    public static final BigDecimal TENTHOUSAND = BigDecimal.valueOf(10_000);

    @Override
    public SplitType getSplitType() {
        return SplitType.PERCENTAGE;
    }

    @Override
    public Map<User, BigDecimal> calculateExpense(Expense amount, Map<User, BigDecimal> memberSplitDto) {
        Map<User, BigDecimal> result = new HashMap<>();
        for (User user : memberSplitDto.keySet()) {
            BigDecimal percentage = memberSplitDto.get(user).multiply(HUNDRED);
            BigDecimal actualAmount = amount.getAmount().multiply(percentage).divide(TENTHOUSAND);

            result.put(user, actualAmount);
        }

        return result;
    }
}
