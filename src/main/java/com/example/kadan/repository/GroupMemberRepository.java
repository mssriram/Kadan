package com.example.kadan.repository;

import com.example.kadan.entity.Group;
import com.example.kadan.entity.GroupMember;
import com.example.kadan.entity.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupMemberRepository extends CrudRepository<GroupMember, UUID> {

    boolean existsByGroupAndUser(Group group, User currentUser);

    void deleteByGroupAndUser(Group group, User user);

    List<GroupMember> findAllByGroup(Group group);
}

