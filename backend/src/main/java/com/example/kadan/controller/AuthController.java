package com.example.kadan.controller;

import com.example.kadan.dto.LoginUserDto;
import com.example.kadan.dto.RegisterUserDto;
import com.example.kadan.dto.RegisterUserResponseDto;
import com.example.kadan.dto.UserProfileDto;
import com.example.kadan.entity.User;
import com.example.kadan.service.AuthService;
import com.example.kadan.service.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    //TODO add password validation.
    //TODO does email as srraim@example accepted?
    @PostMapping("/public/register")
    public ResponseEntity<RegisterUserResponseDto> register(@Valid @RequestBody RegisterUserDto userDto) {
        User newUser = authService.registerUser(userDto);
        RegisterUserResponseDto response = new RegisterUserResponseDto(
                newUser.getId().toString(),
                newUser.getEmail(),
                newUser.getDisplayName(),
                newUser.getDefaultCurrency(),
                newUser.getStatus()
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/public/login")
    public ResponseEntity<UserProfileDto> login(HttpServletResponse response, @Valid @RequestBody LoginUserDto loginUserDto) {
        User user = authService.authenticateUser(loginUserDto);

        String token = jwtService.generateToken(user);
        response.setHeader("Authorization", "Bearer " + token);

        return ResponseEntity.ok(UserProfileDto.fromEntity(user));
    }
}
