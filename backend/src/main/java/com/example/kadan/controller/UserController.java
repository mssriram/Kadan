package com.example.kadan.controller;

import com.example.kadan.config.JwtUserPrincipal;
import com.example.kadan.dto.UpdateUserProfileDto;
import com.example.kadan.dto.UserProfileDto;
import com.example.kadan.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUserProfile(@AuthenticationPrincipal JwtUserPrincipal principal) {
        UserProfileDto response = userService.getUserById(principal.id());
        return ResponseEntity.ok(response);
    }

    //TODO does email as srraim@example accepted?
    @PatchMapping("/me")
    public ResponseEntity<UserProfileDto> updateCurrentUserProfile(@AuthenticationPrincipal JwtUserPrincipal principal, @Valid @RequestBody UpdateUserProfileDto updateDto) {
        UserProfileDto updatedProfile = userService.updateUserProfile(principal.id(), updateDto);
        return ResponseEntity.ok(updatedProfile);
    }

    //TODO should be admin only
    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileDto> getUserById(@PathVariable UUID userId) {
        UserProfileDto profile = userService.getUserById(userId);
        return ResponseEntity.ok(profile);
    }
}
