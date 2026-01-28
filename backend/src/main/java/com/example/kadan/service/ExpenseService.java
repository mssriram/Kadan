package com.example.kadan.service;

import com.example.kadan.dto.CreateExpenseDto;
import com.example.kadan.dto.ExpenseDto;
import com.example.kadan.dto.MemberSplitDto;
import com.example.kadan.dto.UpdateExpenseDto;
import com.example.kadan.dto.enums.GroupStatus;
import com.example.kadan.dto.enums.SplitType;
import com.example.kadan.entity.Expense;
import com.example.kadan.entity.ExpenseSplit;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.User;
import com.example.kadan.expense.DebtCalculationFactory;
import com.example.kadan.expense.ExpenseCalculationFactory;
import com.example.kadan.repository.ExpenseRepository;
import com.example.kadan.repository.ExpenseSplitRepository;
import com.example.kadan.repository.GroupRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final GroupRepository groupRepository;
    private final ExpenseRepository expenseRepository;
    private final ExpenseSplitRepository expenseSplitRepository;
    private final ExpenseCalculationFactory expenseCalcFactory;
    private final DebtCalculationFactory balanceCalcFactory;

    @Transactional
    public List<ExpenseDto> getAllExpenses(UUID currentUser, UUID groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }

        List<Expense> expenses = expenseRepository.findAllByGroup(group).orElseThrow(() -> new EntityNotFoundException("No expenses found for the group"));
        return expenses.stream().map(ExpenseDto::fromEntity).toList();
    }

    @Transactional
    public ExpenseDto getExpenseById(UUID currentUser, UUID groupId, UUID expenseId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }

        Expense expense = expenseRepository.findById(expenseId).orElseThrow(() -> new EntityNotFoundException("Expense not found"));
        return ExpenseDto.fromEntity(expense);
    }

    @Transactional
    public ExpenseDto createExpense(UUID currentUser, UUID groupId, CreateExpenseDto request) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }

        User expenseCreator = group.getMembers().stream().filter(user -> user.getId().equals(currentUser)).findFirst().get();

        Expense expense = Expense.builder()
                .amount(request.amount())
                .currency(request.currency())
                .description(request.description())
                .expenseDate(request.date())
                .splitType(request.splitType())
                .group(group)
                .createdBy(expenseCreator)
                .paidBy(expenseCreator)
                .build();

        if (!request.paidBy().equals(currentUser)) {
            if (!group.hasMember(request.paidBy())) {
                throw new EntityNotFoundException("paidBy user is not a member of the group");
            }
            User paidByUser = group.getMembers().stream().filter(user -> user.getId().equals(request.paidBy())).findFirst().get();
            expense.setPaidBy(paidByUser);
        }
        Expense savedExpense = expenseRepository.save(expense);
        Map<User, BigDecimal> userSplits = getExpenseMembers(request.splitType(), request.members(), group);
        List<ExpenseSplit> expenseSplitList = getExpenseSplits(request.splitType(), savedExpense, userSplits);
        expenseSplitRepository.saveAll(expenseSplitList);

        savedExpense.setExpenseSplits(expenseSplitList);
        return ExpenseDto.fromEntity(savedExpense);
    }

    @Transactional
    public ExpenseDto updateExpense(UUID currentUser, UUID groupId, UUID expenseId, UpdateExpenseDto request) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }
        Expense expense = expenseRepository.findById(expenseId).orElseThrow(() -> new EntityNotFoundException("Expense not found"));
        expense.modifyExpense(request);

        if (Objects.nonNull(request.paidBy()) && !expense.getPaidBy().getId().equals(request.paidBy())) {
            User paidByUser = groupRepository.findMemberByGroupIdAndUserId(group.getId(), request.paidBy(), GroupStatus.ACTIVE).orElseThrow(() -> new EntityNotFoundException("paidBy user is not a member of the group"));
            expense.setPaidBy(paidByUser);
        }

        Expense savedExpense = expenseRepository.save(expense);
        if (ObjectUtils.anyNotNull(request.amount(), request.splitType()) || !ObjectUtils.isEmpty(request.members())) {
            Map<User, BigDecimal> expenseMembers = getExpenseMembers(expense.getSplitType(), request.members(), group);
            List<ExpenseSplit> userSplits = getExpenseSplits(expense.getSplitType(), savedExpense, expenseMembers);
            expenseSplitRepository.deleteAllByExpense(expense);
            expenseSplitRepository.flush();
            expenseSplitRepository.saveAll(userSplits);

            savedExpense.setExpenseSplits(userSplits);
        }

        return ExpenseDto.fromEntity(savedExpense);
    }

    private Map<User, BigDecimal> getExpenseMembers(SplitType splitType, List<MemberSplitDto> members, Group group) {
        Map<UUID, MemberSplitDto> memberSplits = members.stream().collect(Collectors.toMap(MemberSplitDto::id, splitDto -> splitDto));

        Map<User, BigDecimal> result = new HashMap<>();
        // Validate that all requested members belong to the group
        // by iterating through group shares and matching with requested IDs
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

    private List<ExpenseSplit> getExpenseSplits(SplitType splitType, Expense savedExpense, Map<User, BigDecimal> userSplits) {
        Map<User, BigDecimal> result = expenseCalcFactory.strategy(splitType).calculateExpense(savedExpense, userSplits);
        return result.entrySet().stream()
                .map(entry -> {
                    boolean isSettled = entry.getKey().getId().equals(savedExpense.getPaidBy().getId());
                    return ExpenseSplit.builder()
                            .expense(savedExpense)
                            .user(entry.getKey())
                            .amount(entry.getValue())
                            .isSettled(isSettled)
                            .build();
                })
                .toList();
    }

    public void deleteExpense(UUID currentUser, UUID groupId, UUID expenseId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }

        Expense expense = expenseRepository.findById(expenseId).orElseThrow(() -> new EntityNotFoundException("Expense not found"));
        expenseRepository.delete(expense);
    }
}

