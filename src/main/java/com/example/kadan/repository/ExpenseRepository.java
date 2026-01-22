package com.example.kadan.repository;

import com.example.kadan.entity.Expense;
import com.example.kadan.entity.Group;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends CrudRepository<Expense, UUID> {

    Optional<List<Expense>> findAllByGroup(Group group);
}
