package com.example.kadan.expense;

import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.User;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class ExactCalculation implements ExpenseCalculationStrategy {


    @Override
    public SplitType getSplitType() {
        return SplitType.EXACT;
    }

    @Override
    public Map<User, BigDecimal> calculateExpense(Expense amount, Map<User, BigDecimal> memberSplitDto) {
        return memberSplitDto;
    }
}
