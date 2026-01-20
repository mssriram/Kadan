package com.example.kadan.repository;

import com.example.kadan.entity.Expense;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface ExpenseRepository extends CrudRepository<Expense, UUID> {
}
