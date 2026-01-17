package com.example.kadan.controller;

import com.example.kadan.dto.CreateGroupResponseDto;
import com.example.kadan.dto.GroupDto;
import com.example.kadan.dto.GroupResponseDto;
import com.example.kadan.dto.UpdateGroupDto;
import com.example.kadan.entity.User;
import com.example.kadan.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @GetMapping("/{id}")
    public ResponseEntity<GroupResponseDto> getGroupById(@AuthenticationPrincipal User currentUser, @Valid @PathVariable UUID id) {
        GroupResponseDto response = groupService.getGroupById(currentUser, id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<GroupResponseDto>> getGroups(@AuthenticationPrincipal User currentUser) {
        List<GroupResponseDto> response = groupService.getGroups(currentUser);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupResponseDto> updateGroup(@AuthenticationPrincipal User currentUser, @Valid @RequestBody UpdateGroupDto groupDto, @Valid @PathVariable UUID id) {
        GroupResponseDto response = groupService.updateGroup(currentUser, id, groupDto);
        return ResponseEntity.ok(response);
    }


    @PostMapping
    public ResponseEntity<CreateGroupResponseDto> createGroup(@AuthenticationPrincipal User currentUser, @Valid @RequestBody GroupDto groupDto) {
        CreateGroupResponseDto response = groupService.createGroup(currentUser, groupDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@AuthenticationPrincipal User currentUser, @Valid @PathVariable UUID id) {
        groupService.deleteGroup(currentUser, id);
        return ResponseEntity.ok().build();
    }
}