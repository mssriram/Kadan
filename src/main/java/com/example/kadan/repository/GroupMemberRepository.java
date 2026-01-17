package com.example.kadan.repository;

import com.example.kadan.entity.GroupMember;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GroupMemberRepository extends CrudRepository<GroupMember, UUID> {
}

