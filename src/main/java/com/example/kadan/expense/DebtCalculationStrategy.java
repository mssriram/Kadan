package com.example.kadan.expense;

import com.example.kadan.dto.enums.BalanceStrategy;
import com.example.kadan.repository.ExpenseSplitRepository;

import java.util.List;

public interface DebtCalculationStrategy {

    BalanceStrategy getStrategyType();

    List<Debt> calculateDebts(List<ExpenseSplitRepository.GroupBalance> groupBalance);
}
