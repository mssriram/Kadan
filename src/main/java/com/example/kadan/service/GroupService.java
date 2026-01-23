package com.example.kadan.service;

import com.example.kadan.dto.CreateGroupResponseDto;
import com.example.kadan.dto.GroupDto;
import com.example.kadan.dto.GroupResponseDto;
import com.example.kadan.dto.UpdateGroupDto;
import com.example.kadan.dto.enums.GroupStatus;
import com.example.kadan.dto.enums.UserRole;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.GroupMember;
import com.example.kadan.entity.User;
import com.example.kadan.repository.GroupMemberRepository;
import com.example.kadan.repository.GroupRepository;
import com.example.kadan.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    //TODO members is returned as null. should exclude from response body.
    @Transactional
    public List<GroupResponseDto> getGroups(UUID currentUser) {
        List<Group> groups = groupRepository.findByMembers_IdAndStatusNot(currentUser, GroupStatus.DELETED);
        if (groups.isEmpty()) {
            throw new EntityNotFoundException("No groups found for the user");
        }
        return groups.stream().map(GroupResponseDto::fromEntityWithoutMembers).collect(Collectors.toList());
    }

    @Transactional
    public GroupResponseDto getGroupById(UUID currentUser, UUID id) {
        Group group = groupRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }

        return GroupResponseDto.fromEntity(group);
    }

    @Transactional
    public GroupResponseDto updateGroup(UUID currentUser, UUID id, UpdateGroupDto groupDto) {
        Group group = groupRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }

        if (StringUtils.isNotBlank(groupDto.name())) group.setName(groupDto.name());
        if (StringUtils.isNotBlank(groupDto.description())) group.setDescription(groupDto.description());
        if (groupDto.simplifyDebts() != null) group.setSimplifyDebts(groupDto.simplifyDebts());
        if (StringUtils.isNotBlank(groupDto.currency())) group.setCurrency(groupDto.currency());
        Group updatedGroup = groupRepository.save(group);

        return GroupResponseDto.fromEntity(updatedGroup);
    }

    //TODO update to check if memberId already part of group. can throw 409 conflict
    //TODO returning stale data, need to fetch updated group with members
    @Transactional
    public GroupResponseDto addMemberToGroup(UUID currentUser, UUID groupId, UUID memberId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }

        User newMember = userRepository.findById(memberId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        try {
            GroupMember groupMember = new GroupMember(group, newMember, UserRole.MEMBER);
            groupMemberRepository.save(groupMember);
        } catch (DataIntegrityViolationException e) {
            log.info("User {} is already a member of group {}", memberId, groupId);
        }

        return GroupResponseDto.fromEntity(group);
    }

    @Transactional
    public CreateGroupResponseDto createGroup(UUID currentUser, GroupDto groupDto) {
        User groupCreatorUser = userRepository.findById(currentUser).orElseThrow(() -> new EntityNotFoundException("User not found"));

        Group group = new Group();
        group.setName(groupDto.name());
        group.setDescription(groupDto.description());
        group.setCreatedBy(groupCreatorUser);
        group.setSimplifyDebts(groupDto.simplifyDebts());
        group.setStatus(GroupStatus.ACTIVE);
        Group savedGroup = groupRepository.save(group);

        List<User> members = userRepository.findByEmailIn(groupDto.members());

        List<GroupMember> groupMembers = members.stream()
                .map(user -> user.getId() == currentUser ?
                        new GroupMember(savedGroup, user, UserRole.OWNER) :
                        new GroupMember(savedGroup, user, UserRole.MEMBER))
                .toList();
        Iterable<GroupMember> savedMembers = groupMemberRepository.saveAll(groupMembers);
        List<User> savedUsers = StreamSupport.stream(savedMembers.spliterator(), false).map(GroupMember::getUser).collect(Collectors.toList());

        boolean creatorInList = members.stream().anyMatch(user -> user.getId().equals(currentUser));
        if (!creatorInList) {
            GroupMember creatorMember = new GroupMember(savedGroup, groupCreatorUser, UserRole.OWNER);
            groupMemberRepository.save(creatorMember);
            savedUsers.add(creatorMember.getUser());
        }

        return CreateGroupResponseDto.fromEntity(savedGroup, savedUsers);
    }

    @Transactional
    public void removeMemberFromGroup(UUID currentUser, UUID groupId, UUID memberId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }

        User memberToRemove = userRepository.findById(memberId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        groupMemberRepository.deleteByGroupAndUser(group, memberToRemove);
    }

    @Transactional
    public void deleteGroup(UUID currentUser, UUID groupId) {
        //TODO delete group not allwoed when balances are non zero.
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("Group not found");
        }

        groupRepository.delete(group);
    }

}
