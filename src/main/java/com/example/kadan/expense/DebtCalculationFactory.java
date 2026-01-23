package com.example.kadan.expense;

import com.example.kadan.dto.enums.DebtStrategy;
import com.example.kadan.repository.ExpenseSplitRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class DebtCalculationFactory {

    Map<DebtStrategy, DebtCalculationStrategy> strategies;
    ExpenseSplitRepository expenseSplitRepository;

    public DebtCalculationFactory(List<DebtCalculationStrategy> strategies, ExpenseSplitRepository expenseSplitRepository) {
        this.strategies = strategies.stream().collect(Collectors.toMap(DebtCalculationStrategy::getStrategyType, strategy -> strategy));
        this.expenseSplitRepository = expenseSplitRepository;
    }

    public DebtCalculationStrategy strategy(DebtStrategy strategyType) {
        return strategies.get(strategyType);
    }

}
