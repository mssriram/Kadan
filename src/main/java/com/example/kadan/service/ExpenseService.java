package com.example.kadan.service;

import com.example.kadan.dto.CreateExpenseDto;
import com.example.kadan.dto.MemberSplitDto;
import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.ExpenseSplit;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.User;
import com.example.kadan.expense.ExpenseCalculationStrategyFactory;
import com.example.kadan.repository.ExpenseRepository;
import com.example.kadan.repository.ExpenseSplitRepository;
import com.example.kadan.repository.GroupRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final ExpenseCalculationStrategyFactory expenseCalcFactory;

    @Transactional
    public Object createExpense(User currentUser, UUID groupId, CreateExpenseDto request) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser.getId())) {
            throw new EntityNotFoundException("Group not found");
        }

        Expense expense = Expense.builder()
                .amount(request.amount())
                .currency(request.currency())
                .description(request.description())
                .expenseDate(request.date())
                .splitType(request.splitType())
                .group(group)
                .createdBy(currentUser)
                .paidBy(currentUser)
                .build();

        if (!request.paidBy().equals(currentUser.getId())) {
            User paidByUser = groupRepository.getMemberById(request.paidBy()).orElseThrow(() -> new EntityNotFoundException("paidBy user is not a member of the group"));
            expense.setPaidBy(paidByUser);
        }
        Map<User, BigDecimal> userSplits = getExpenseMembers(request.splitType(), request.members(), group);

        Expense savedExpense = expenseRepository.save(expense);

        List<ExpenseSplit> expenseSplitList = expenseCalcFactory.strategy(request.splitType()).calculateExpense(savedExpense, userSplits);
        expenseSplitRepository.saveAll(expenseSplitList);
        return null;
    }
    
    private Map<User, BigDecimal> getExpenseMembers(SplitType splitType, List<MemberSplitDto> members, Group group) {
        Map<UUID, MemberSplitDto> memberSplits = members.stream().collect(Collectors.toMap(MemberSplitDto::id, splitDto -> splitDto));

        Map<User, BigDecimal> result = new HashMap<>();
        // Validate that all requested members belong to the group
        // by iterating through group members and matching with requested IDs
        for (User user : group.getMembers()) {
            if (memberSplits.containsKey(user.getId())) {
                result.put(user, splitType.equals(SplitType.EQUAL) ? BigDecimal.ZERO : memberSplits.get(user.getId()).share());
            }
        }

        if (result.size() != memberSplits.size()) {
            throw new EntityNotFoundException("One or more users are not members of the group");
        }

        return result;
    }

    public Object getAllExpenses(UUID groupId, Object request) {
        // TODO: Implement
        return null;
    }

    public Object getExpenseById(UUID groupId, UUID expenseId) {
        // TODO: Implement
        return null;
    }

    public Object updateExpense(UUID groupId, UUID expenseId, Object request) {
        // TODO: Implement
        return null;
    }

    public void deleteExpense(UUID groupId, UUID expenseId) {
        // TODO: Implement
    }
}

