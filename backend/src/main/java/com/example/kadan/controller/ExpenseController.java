package com.example.kadan.controller;

import com.example.kadan.config.JwtUserPrincipal;
import com.example.kadan.dto.CreateExpenseDto;
import com.example.kadan.dto.ExpenseDto;
import com.example.kadan.dto.UpdateExpenseDto;
import com.example.kadan.service.ExpenseService;
import com.example.kadan.validator.ExpenseValidator;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping
    public ResponseEntity<List<ExpenseDto>> getAllExpenses(@AuthenticationPrincipal JwtUserPrincipal principal, @PathVariable UUID groupId) {
        List<ExpenseDto> expenses = expenseService.getAllExpenses(principal.id(), groupId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpenseDto> getExpenseById(@AuthenticationPrincipal JwtUserPrincipal principal, @PathVariable UUID groupId, @PathVariable UUID expenseId) {
        ExpenseDto expense = expenseService.getExpenseById(principal.id(), groupId, expenseId);
        return ResponseEntity.ok(expense);
    }

    //TODO update to include scenario where multiple people paid for the same expense
    @PostMapping
    public ResponseEntity<ExpenseDto> createExpense(@AuthenticationPrincipal JwtUserPrincipal principal, @PathVariable UUID groupId, @Valid @RequestBody CreateExpenseDto request) {
        ExpenseValidator.validateCreateExpense(request);
        ExpenseDto response = expenseService.createExpense(principal.id(), groupId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{expenseId}")
    public ResponseEntity<ExpenseDto> updateExpense(@AuthenticationPrincipal JwtUserPrincipal principal, @PathVariable UUID groupId, @PathVariable UUID expenseId, @Valid @RequestBody UpdateExpenseDto request) {
        ExpenseValidator.validateUpdateExpense(request);
        ExpenseDto response = expenseService.updateExpense(principal.id(), groupId, expenseId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@AuthenticationPrincipal JwtUserPrincipal principal, @PathVariable UUID groupId, @PathVariable UUID expenseId) {
        expenseService.deleteExpense(principal.id(), groupId, expenseId);
        return ResponseEntity.ok().build();
    }
}
