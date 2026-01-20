package com.example.kadan.expense;

import com.example.kadan.dto.enums.SplitType;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class ExpenseCalculationStrategyFactory {

    private final Map<SplitType, ExpenseCalculationStrategy> strategies;

    public ExpenseCalculationStrategyFactory(List<ExpenseCalculationStrategy> strategies) {
        this.strategies = strategies.stream().collect(Collectors.toMap(ExpenseCalculationStrategy::getSplitType, strategy -> strategy));
    }

    public ExpenseCalculationStrategy strategy(SplitType splitType) {
        return strategies.get(splitType);
    }
}
