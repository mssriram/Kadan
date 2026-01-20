package com.example.kadan.controller;

import com.example.kadan.dto.CreateExpenseDto;
import com.example.kadan.entity.User;
import com.example.kadan.service.ExpenseService;
import com.example.kadan.validator.ExpenseValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups/{groupId}/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<?> createExpense(@AuthenticationPrincipal User user, @PathVariable UUID groupId, @RequestBody CreateExpenseDto request) {
        ExpenseValidator.validateCreateExpense(request);
        expenseService.createExpense(user, groupId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<?> getAllExpenses(@PathVariable UUID groupId, @RequestBody Object request) {
        return null;
    }

    @GetMapping("/{expenseId}")
    public ResponseEntity<?> getExpenseById(@PathVariable UUID groupId, @PathVariable UUID expenseId) {
        // TODO: Implement
        return null;
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<?> updateExpense(@PathVariable UUID groupId, @PathVariable UUID expenseId, @RequestBody Object request) {
        // TODO: Implement
        return null;
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<?> deleteExpense(@PathVariable UUID groupId, @PathVariable UUID expenseId) {
        // TODO: Implement
        return null;
    }
}
