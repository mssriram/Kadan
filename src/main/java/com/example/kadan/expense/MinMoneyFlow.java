package com.example.kadan.expense;

import com.example.kadan.dto.enums.BalanceStrategy;
import com.example.kadan.repository.ExpenseSplitRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class MinMoneyFlow implements DebtCalculationStrategy {

    @Override
    public BalanceStrategy getStrategyType() {
        return BalanceStrategy.MINFLOW;
    }

    @Override
    public List<Debt> calculateDebts(List<ExpenseSplitRepository.GroupBalance> groupBalance) {
        Map<UUID, BigDecimal> owes = groupBalance.stream()
                .filter(e -> e.getNetBalance().compareTo(BigDecimal.ZERO) < 0)
                .collect(Collectors.toMap(ExpenseSplitRepository.GroupBalance::getUserId, ExpenseSplitRepository.GroupBalance::getNetBalance));
        Map<UUID, BigDecimal> paid = groupBalance.stream()
                .filter(e -> e.getNetBalance().compareTo(BigDecimal.ZERO) > 0)
                .collect(Collectors.toMap(ExpenseSplitRepository.GroupBalance::getUserId, ExpenseSplitRepository.GroupBalance::getNetBalance));

        List<Debt> result = new ArrayList<>();
        while (!owes.isEmpty() && !paid.isEmpty()) {
            UUID owesUser = owes.keySet().iterator().next();
            UUID paidUser = paid.keySet().iterator().next();

            BigDecimal owesAmount = owes.get(owesUser);
            BigDecimal paidAmount = paid.get(paidUser);
            BigDecimal amount = owesAmount.abs().min(paidAmount);

            owes.put(owesUser, owesAmount.add(amount));
            paid.put(paidUser, paidAmount.subtract(amount));

            if (owes.get(owesUser).compareTo(BigDecimal.ZERO) == 0) {
                owes.remove(owesUser);
            }
            if (paid.get(paidUser).compareTo(BigDecimal.ZERO) == 0) {
                paid.remove(paidUser);
            }

            result.add(new Debt(owesUser, paidUser, amount));
        }

        return result;
    }
}
