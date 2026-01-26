package com.example.kadan.service;

import com.example.kadan.dto.BalanceResponseDto;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class GroupService {

    private final BalanceService balanceService;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

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
            throw new EntityNotFoundException("User not found");
        }

        return GroupResponseDto.fromEntity(group);
    }

    @Transactional
    public GroupResponseDto updateGroup(UUID currentUser, UUID id, UpdateGroupDto groupDto) {
        Group group = groupRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("User not found");
        }

        if (StringUtils.isNotBlank(groupDto.name())) group.setName(groupDto.name());
        if (StringUtils.isNotBlank(groupDto.description())) group.setDescription(groupDto.description());
        if (groupDto.simplifyDebts() != null) group.setSimplifyDebts(groupDto.simplifyDebts());
        if (StringUtils.isNotBlank(groupDto.currency())) group.setCurrency(groupDto.currency());
        Group updatedGroup = groupRepository.save(group);

        return GroupResponseDto.fromEntity(updatedGroup);
    }

    //TODO Users other than owner in should be in pending state in group memeber repo until they accept.
    @Transactional
    public void addMemberToGroup(UUID currentUser, UUID groupId, UUID memberId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("User not found");
        }

        //Return success if member already part of group
        if (group.hasMember(memberId)) {
            log.info("User {} is already a member of group {}", memberId, groupId);
            return;
        }

        User newMember = userRepository.findById(memberId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        GroupMember groupMember = new GroupMember(group, newMember, UserRole.MEMBER);
        groupMemberRepository.save(groupMember);
    }

    //TODO Users other than owner in should be in pending state in group memeber repo until they accept.
    //TODO members list can be null. should handle that case.
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

        boolean creatorInList = members.stream().anyMatch(user -> user.getId().equals(currentUser));
        if (!creatorInList) {
            GroupMember creatorMember = new GroupMember(savedGroup, groupCreatorUser, UserRole.OWNER);
            groupMemberRepository.save(creatorMember);
        }

        return CreateGroupResponseDto.fromEntity(savedGroup);
    }

    //TODO If owner is removed, transfer ownership to another member.
    //TODO Prevent removing self if owner and other members exist. maybe possible.
    @Transactional
    public void removeMemberFromGroup(UUID currentUser, UUID groupId, UUID memberId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser) || !group.hasMember(memberId)) {
            throw new EntityNotFoundException("User not found");
        }
        if (group.getMembers().size() == 1) {
            throw new DataIntegrityViolationException("Cannot remove the only member of the group");
        }

        BalanceResponseDto response = balanceService.getBalances(group);
        if (response.doesMemberHaveBalance(memberId)) {
            throw new DataIntegrityViolationException("Cannot remove member with non-zero balances");
        }

        User memberToRemove = userRepository.findById(memberId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        groupMemberRepository.deleteByGroupAndUser(group, memberToRemove);
    }

    //TODO maybe consider only owners can delete groups.
    @Transactional
    public void deleteGroup(UUID currentUser, UUID groupId) {
        Group group = groupRepository.findById(groupId).orElseThrow(() -> new EntityNotFoundException("Group not found"));
        if (!group.hasMember(currentUser)) {
            throw new EntityNotFoundException("User not found");
        }

        BalanceResponseDto groupBalances = balanceService.getBalances(group);
        if (!groupBalances.balances().isEmpty()) {
            throw new DataIntegrityViolationException("Cannot delete group with non-zero balances");
        }

        groupRepository.delete(group);
    }

}
