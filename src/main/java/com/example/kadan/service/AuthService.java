package com.example.kadan.service;

import com.example.kadan.dto.LoginUserDto;
import com.example.kadan.dto.RegisterUserDto;
import com.example.kadan.dto.enums.UserStatus;
import com.example.kadan.entity.User;
import com.example.kadan.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public User registerUser(RegisterUserDto userDto) {
        if (userRepository.findByUsername(userDto.username()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(userDto.email()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(userDto.username());
        user.setEmail(userDto.email());
        user.setPasswordHash(passwordEncoder.encode(userDto.password()));
        user.setStatus(UserStatus.ACTIVE);

        return userRepository.save(user);
    }

    public User authenticateUser(@Valid LoginUserDto loginUserDto) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginUserDto.username(), loginUserDto.password()));

        return userRepository.findByUsername(loginUserDto.username()).orElseThrow();
    }
}

