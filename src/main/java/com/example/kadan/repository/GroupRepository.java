package com.example.kadan.repository;

import com.example.kadan.entity.Group;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GroupRepository extends CrudRepository<Group, UUID> {
}