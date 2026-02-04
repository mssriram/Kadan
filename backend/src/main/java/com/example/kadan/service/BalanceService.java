package com.example.kadan.service;

import com.example.kadan.dto.BalanceResponseDto;
import com.example.kadan.dto.MemberBalanceDto;
import com.example.kadan.dto.SettlementDto;
import com.example.kadan.dto.SettlementResponseDto;
import com.example.kadan.dto.UserGroupBalancesDto;
import com.example.kadan.dto.enums.DebtStrategy;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.Settlement;
import com.example.kadan.entity.User;
import com.example.kadan.expense.Debt;
import com.example.kadan.expense.DebtCalculationFactory;
import com.example.kadan.repository.ExpenseSplitRepository;
import com.example.kadan.repository.GroupRepository;
import com.example.kadan.repository.SettlementRepository;
import com.example.kadan.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final SettlementRepository settlementRepository;
    private final DebtCalculationFactory debtCalcFactory;

    public BalanceResponseDto getBalances(UUID currentUser, UUID groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("User is not a member of the group");
        }

        return getBalances(group);
    }

    //TODO implement no new transfers algorithm
    public BalanceResponseDto getBalances(Group group) {
        List<ExpenseSplitRepository.GroupBalance> balances = expenseSplitRepository.findGroupBalances(group.getId());
        List<Debt> debts = debtCalcFactory.calculateDebts(group.getId(), group.isSimplifyDebts());

        Map<UUID, ExpenseSplitRepository.GroupBalance> memberIds = balances.stream().collect(Collectors.toMap(ExpenseSplitRepository.GroupBalance::getUserId, balance -> balance));
        List<User> members = userRepository.findAllById(memberIds.keySet());

        List<MemberBalanceDto> memberBalances = MemberBalanceDto.from(members, memberIds);

        return new BalanceResponseDto(memberBalances, debts);
    }

    public List<UserGroupBalancesDto> getAllUserBalances(UUID currentUser) {
        List<ExpenseSplitRepository.UserGroupBalance> groups = expenseSplitRepository.findUserBalances(currentUser);
        return groups.stream().map(UserGroupBalancesDto::fromEntity).toList();
    }

    public SettlementResponseDto recordSettlement(UUID debtorId, UUID groupId, SettlementDto settlementDto) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(debtorId) || !group.hasMember(settlementDto.creditor_id())) {
            throw new EntityNotFoundException("User is not a member of the group");
        }
        User creditor = group.getMembers().stream().filter(user -> user.getId().equals(settlementDto.creditor_id())).findFirst().get();
        User debtor = group.getMembers().stream().filter(user -> user.getId().equals(debtorId)).findFirst().get();

        if (creditor.getId().equals(debtor.getId())) {
            throw new DataIntegrityViolationException("Creditor and debtor cannot be the same user");
        }
        Settlement settlement = Settlement.builder()
                .creditor(creditor)
                .debtor(debtor)
                .amount(settlementDto.amount())
                .currency(settlementDto.currency())
                .group(group)
                .build();

        Settlement saved = settlementRepository.save(settlement);

        return SettlementResponseDto.fromEntity(saved);
    }
}
