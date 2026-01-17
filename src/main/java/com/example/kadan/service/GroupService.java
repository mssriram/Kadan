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
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public GroupResponseDto getGroupById(User currentUser, UUID id) {
        Group group = groupRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Group not found"));
        boolean isMember = groupMemberRepository.existsByGroupAndUser(group, currentUser);

        if (!isMember || group.getStatus().equals(GroupStatus.DELETED)) {
            throw new EntityNotFoundException("Group not found");
        }

        return GroupResponseDto.fromEntity(group);
    }

    public List<GroupResponseDto> getGroups(User currentUser) {
        List<Group> groups = groupRepository.findAllByMembersAndStatusNot(currentUser, GroupStatus.DELETED);
        if (groups.isEmpty()) {
            throw new EntityNotFoundException("No groups found for the user");
        }
        return groups.stream().map(GroupResponseDto::fromEntityWithoutMembers).collect(Collectors.toList());
    }

    public GroupResponseDto updateGroup(User currentUser, @Valid UUID id, @Valid UpdateGroupDto groupDto) {
        Group group = groupRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Group not found"));
        boolean isMember = groupMemberRepository.existsByGroupAndUser(group, currentUser);

        if (!isMember || group.getStatus().equals(GroupStatus.DELETED)) {
            throw new EntityNotFoundException("Group not found");
        }

        group.setName(groupDto.name());
        group.setDescription(groupDto.description());
        group.setSimplifyDebts(groupDto.simplifyDebts());
        group.setCurrency(groupDto.currency());
        Group updatedGroup = groupRepository.save(group);

        return GroupResponseDto.fromEntity(updatedGroup);
    }

    @Transactional
    public CreateGroupResponseDto createGroup(User currentUser, GroupDto groupDto) {
        Group group = new Group();
        group.setName(groupDto.name());
        group.setDescription(groupDto.description());
        group.setCreatedBy(currentUser);
        group.setSimplifyDebts(groupDto.simplifyDebts());
        group.setStatus(GroupStatus.ACTIVE);
        Group savedGroup = groupRepository.save(group);

        List<User> members = userRepository.findByUsernameIn(groupDto.memberUsernames());

        List<GroupMember> groupMembers = members.stream()
                .map(user -> user == currentUser ?
                        new GroupMember(savedGroup, user, UserRole.OWNER) :
                        new GroupMember(savedGroup, user, UserRole.MEMBER))
                .toList();
        Iterable<GroupMember> savedMembers = groupMemberRepository.saveAll(groupMembers);
        List<User> savedUsers = StreamSupport.stream(savedMembers.spliterator(), false).map(GroupMember::getUser).collect(Collectors.toList());

        boolean creatorInList = members.stream().anyMatch(user -> user.getId().equals(currentUser.getId()));
        if (!creatorInList) {
            GroupMember creatorMember = new GroupMember(savedGroup, currentUser, UserRole.OWNER);
            groupMemberRepository.save(creatorMember);
            savedUsers.add(creatorMember.getUser());
        }

        return CreateGroupResponseDto.fromEntity(savedGroup, savedUsers);
    }

    public void deleteGroup(User currentUser, UUID id) {
        Group group = groupRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Group not found"));
        boolean isMember = groupMemberRepository.existsByGroupAndUser(group, currentUser);

        if (!isMember || group.getStatus().equals(GroupStatus.DELETED)) {
            throw new EntityNotFoundException("Group not found");
        }

        group.setStatus(GroupStatus.DELETED);
        groupRepository.save(group);
    }
}
