package com.example.kadan.controller;

import com.example.kadan.dto.BalanceResponseDto;
import com.example.kadan.entity.User;
import com.example.kadan.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups/{groupId}/balances")
public class BalanceController {

    private final BalanceService balanceService;

    @GetMapping()
    public ResponseEntity<BalanceResponseDto> getBalances(@AuthenticationPrincipal User user, @PathVariable UUID groupId) {
        BalanceResponseDto response = balanceService.getBalances(user, groupId);
        return ResponseEntity.ok(response);
    }
}
