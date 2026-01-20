package com.example.kadan.expense;

import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.ExpenseSplit;
import com.example.kadan.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class PercentageCalculation implements ExpenseCalculationStrategy {

    @Override
    public SplitType getSplitType() {
        return SplitType.PERCENTAGE;
    }

    @Override
    public Map<User, BigDecimal> calculateExpense(Expense amount, Map<User, BigDecimal> memberSplitDto) {
        Map<User, BigDecimal> result = new HashMap<>();
        for (User user : memberSplitDto.keySet()) {
            BigDecimal percentage = memberSplitDto.get(user);
            //calculate actual value from percentage
            BigDecimal actualAmount = amount.getAmount().multiply(percentage).divide(BigDecimal.valueOf(100), 2, RoundingMode.DOWN);

            result.put(user, actualAmount);
        }

        return result;
    }
}
