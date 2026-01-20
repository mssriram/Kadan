package com.example.kadan.expense;

import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.ExpenseSplit;
import com.example.kadan.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Component
public class ExactCalculation implements ExpenseCalculationStrategy {


    @Override
    public SplitType getSplitType() {
        return SplitType.EXACT;
    }

    @Override
    public List<ExpenseSplit> calculateExpense(Expense amount, Map<User, BigDecimal> memberSplitDto) {
        return memberSplitDto.entrySet().stream().map(entry ->
            ExpenseSplit.builder()
                .expense(amount)
                .user(entry.getKey())
                .amount(entry.getValue())
                .isSettled(false)
                .build()
        ).toList();
    }
}
