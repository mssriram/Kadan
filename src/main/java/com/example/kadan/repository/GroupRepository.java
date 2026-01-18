package com.example.kadan.repository;

import com.example.kadan.dto.enums.GroupStatus;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupRepository extends CrudRepository<Group, UUID> {

    Optional<Group> findByIdAndStatusNot(UUID id, GroupStatus status);

    List<Group> findAllByMembersAndStatusNot(User currentUser, GroupStatus status);
}