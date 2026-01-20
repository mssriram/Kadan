package com.example.kadan.repository;

import com.example.kadan.entity.ExpenseSplit;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface ExpenseSplitRepository extends CrudRepository<ExpenseSplit, UUID> {
}
