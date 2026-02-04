package com.example.kadan.expense;

import com.example.kadan.dto.enums.DebtStrategy;
import com.example.kadan.repository.ExpenseSplitRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class DebtCalculationFactory {

    Map<DebtStrategy, DebtCalculationStrategy> strategies;
    ExpenseSplitRepository expenseSplitRepository;

    public DebtCalculationFactory(List<DebtCalculationStrategy> strategies, ExpenseSplitRepository expenseSplitRepository) {
        this.strategies = strategies.stream().collect(Collectors.toMap(DebtCalculationStrategy::getStrategyType, strategy -> strategy));
        this.expenseSplitRepository = expenseSplitRepository;
    }

    public DebtCalculationStrategy strategy(boolean isSimplifyDebts) {
        DebtStrategy debtStrategy = isSimplifyDebts ? DebtStrategy.NONEWTRANSFERS : DebtStrategy.MINFLOW;
        return strategies.get(debtStrategy);
    }

    public List<Debt> calculateDebts(UUID groupId, boolean isSimplifyDebts) {
        DebtStrategy strategy = isSimplifyDebts ? DebtStrategy.NONEWTRANSFERS : DebtStrategy.MINFLOW;
        if (isSimplifyDebts) {
            return null;
        } else {
            List<ExpenseSplitRepository.GroupBalance> balances = expenseSplitRepository.findGroupBalances(groupId);
            return strategies.get(strategy).calculateDebts(balances);
        }
    }

}
