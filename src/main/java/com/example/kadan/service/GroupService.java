package com.example.kadan.service;

import com.example.kadan.dto.CreateGroupResponseDto;
import com.example.kadan.dto.GroupDto;
import com.example.kadan.dto.enums.GroupStatus;
import com.example.kadan.dto.enums.UserRole;
import com.example.kadan.entity.Group;
import com.example.kadan.entity.GroupMember;
import com.example.kadan.entity.User;
import com.example.kadan.repository.GroupMemberRepository;
import com.example.kadan.repository.GroupRepository;
import com.example.kadan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

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
}
