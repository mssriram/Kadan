package com.example.kadan.repository;

import com.example.kadan.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SettlementRepository extends JpaRepository<Settlement, UUID> {
}
