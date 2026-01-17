package com.example.kadan.controller;

import com.example.kadan.dto.CreateGroupResponseDto;
import com.example.kadan.dto.GroupDto;
import com.example.kadan.entity.User;
import com.example.kadan.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<CreateGroupResponseDto> createGroup(@AuthenticationPrincipal User currentUser, @Valid @RequestBody GroupDto groupDto) {
        CreateGroupResponseDto response  = groupService.createGroup(currentUser, groupDto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
