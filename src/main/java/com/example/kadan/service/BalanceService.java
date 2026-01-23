package com.example.kadan.service;

import com.example.kadan.dto.BalanceResponseDto;
import com.example.kadan.dto.MemberBalanceDto;
import com.example.kadan.dto.enums.DebtStrategy;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.User;
import com.example.kadan.expense.Debt;
import com.example.kadan.expense.DebtCalculationFactory;
import com.example.kadan.repository.ExpenseSplitRepository;
import com.example.kadan.repository.GroupRepository;
import com.example.kadan.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BalanceService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final DebtCalculationFactory debtCalcFactory;

    public BalanceResponseDto getBalances(User user, UUID groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(user.getId())) {
            throw new EntityNotFoundException("User is not a member of the group");
        }

        List<ExpenseSplitRepository.GroupBalance> balances = expenseSplitRepository.findGroupBalances(groupId);
        DebtStrategy debtStrategy = group.isSimplifyDebts() ? DebtStrategy.NONEWTRANSFERS : DebtStrategy.MINFLOW;
        List<Debt> debts = debtCalcFactory.strategy(debtStrategy).calculateDebts(balances);

        Map<UUID, ExpenseSplitRepository.GroupBalance> memberIds = balances.stream().collect(Collectors.toMap(ExpenseSplitRepository.GroupBalance::getUserId, balance -> balance));
        List<User> members = userRepository.findAllById(memberIds.keySet());

        List<MemberBalanceDto> memberBalances = MemberBalanceDto.from(members, memberIds);

        return new BalanceResponseDto(memberBalances, debts);
    }
}
