package com.example.kadan.expense;

import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.ExpenseSplit;
import com.example.kadan.entity.User;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ExpenseCalculationStrategy {

    SplitType getSplitType();

    List<ExpenseSplit> calculateExpense(Expense amount, Map<User, BigDecimal> memberSplitDto);
}
