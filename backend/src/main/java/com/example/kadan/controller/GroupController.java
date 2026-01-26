package com.example.kadan.controller;

import com.example.kadan.config.JwtUserPrincipal;
import com.example.kadan.dto.CreateGroupResponseDto;
import com.example.kadan.dto.GroupDto;
import com.example.kadan.dto.GroupResponseDto;
import com.example.kadan.dto.UpdateGroupDto;
import com.example.kadan.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<GroupResponseDto>> getGroups(@AuthenticationPrincipal JwtUserPrincipal principal) {
        List<GroupResponseDto> response = groupService.getGroups(principal.id());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponseDto> getGroupById(@AuthenticationPrincipal JwtUserPrincipal principal, @Valid @PathVariable UUID groupId) {
        GroupResponseDto response = groupService.getGroupById(principal.id(), groupId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{groupId}")
    public ResponseEntity<GroupResponseDto> updateGroup(@AuthenticationPrincipal JwtUserPrincipal principal, @RequestBody UpdateGroupDto groupDto, @PathVariable UUID groupId) {
        GroupResponseDto response = groupService.updateGroup(principal.id(), groupId, groupDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<GroupResponseDto> addMemberToGroup(@AuthenticationPrincipal JwtUserPrincipal principal, @PathVariable UUID groupId, @PathVariable UUID memberId) {
        groupService.addMemberToGroup(principal.id(), groupId, memberId);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<CreateGroupResponseDto> createGroup(@AuthenticationPrincipal JwtUserPrincipal principal, @Valid @RequestBody GroupDto groupDto) {
        CreateGroupResponseDto response = groupService.createGroup(principal.id(), groupDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{groupId}/members/{memberId}")
    public ResponseEntity<GroupResponseDto> removeMemberFromGroup(@AuthenticationPrincipal JwtUserPrincipal principal, @PathVariable UUID groupId, @PathVariable UUID memberId) {
        groupService.removeMemberFromGroup(principal.id(), groupId, memberId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@AuthenticationPrincipal JwtUserPrincipal principal, @Valid @PathVariable UUID groupId) {
        groupService.deleteGroup(principal.id(), groupId);
        return ResponseEntity.ok().build();
    }
}