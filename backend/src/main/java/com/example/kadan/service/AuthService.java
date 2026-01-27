package com.example.kadan.service;

import com.example.kadan.dto.LoginUserDto;
import com.example.kadan.dto.RegisterUserDto;
import com.example.kadan.dto.enums.UserStatus;
import com.example.kadan.entity.User;
import com.example.kadan.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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
        if (userRepository.findByEmail(userDto.email()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setEmail(userDto.email().trim());
        user.setPasswordHash(passwordEncoder.encode(userDto.password().trim()));
        user.setDisplayName(userDto.displayName());
        user.setDefaultCurrency("INR");
        user.setStatus(UserStatus.ACTIVE);

        return userRepository.save(user);
    }

    @Transactional
    public User authenticateUser(LoginUserDto loginUserDto) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginUserDto.email(), loginUserDto.password()));

        return (User) authentication.getPrincipal();
    }
}

