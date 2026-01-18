package com.example.kadan.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups/{groupId}/expenses")
public class ExpenseController {

    @PostMapping
    public ResponseEntity<?> createExpense(@PathVariable UUID groupId, @RequestBody Object request) {
        // TODO: Implement
        return null;
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
