package com.example.kadan.repository;

import com.example.kadan.entity.Expense;
import com.example.kadan.entity.ExpenseSplit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExpenseSplitRepository extends JpaRepository<ExpenseSplit, UUID> {

    void deleteAllByExpense(Expense expense);
}
