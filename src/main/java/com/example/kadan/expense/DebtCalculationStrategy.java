package com.example.kadan.expense;

import com.example.kadan.dto.enums.DebtStrategy;
import com.example.kadan.repository.ExpenseSplitRepository;

import java.util.List;

public interface DebtCalculationStrategy {

    DebtStrategy getStrategyType();

    List<Debt> calculateDebts(List<ExpenseSplitRepository.GroupBalance> groupBalance);
}
