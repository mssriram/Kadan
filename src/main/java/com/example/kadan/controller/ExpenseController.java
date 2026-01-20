package com.example.kadan.controller;

import com.example.kadan.dto.CreateExpenseDto;
import com.example.kadan.dto.ExpenseDto;
import com.example.kadan.dto.UpdateExpenseDto;
import com.example.kadan.entity.User;
import com.example.kadan.service.ExpenseService;
import com.example.kadan.validator.ExpenseValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> getAllExpenses(@AuthenticationPrincipal User user, @PathVariable UUID groupId) {
        List<ExpenseDto> expenses = expenseService.getAllExpenses(user, groupId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseDto> getExpenseById(@AuthenticationPrincipal User user, @PathVariable UUID groupId, @PathVariable UUID expenseId) {
        ExpenseDto expense = expenseService.getExpenseById(user, groupId, expenseId);
        return ResponseEntity.ok(expense);
    }

    @PostMapping
    public ResponseEntity<Void> createExpense(@AuthenticationPrincipal User user, @PathVariable UUID groupId, @RequestBody CreateExpenseDto request) {
        ExpenseValidator.validateCreateExpense(request);
        expenseService.createExpense(user, groupId, request);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{expenseId}")
    public ResponseEntity<Void> updateExpense(@AuthenticationPrincipal User user, @PathVariable UUID groupId, @PathVariable UUID expenseId, @RequestBody UpdateExpenseDto request) {
        expenseService.updateExpense(user, groupId, expenseId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@AuthenticationPrincipal User user, @PathVariable UUID groupId, @PathVariable UUID expenseId) {
        expenseService.deleteExpense(user, groupId, expenseId);
        return ResponseEntity.ok().build();
    }
}
