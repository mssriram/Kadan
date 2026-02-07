package com.example.kadan.service;

import com.example.kadan.dto.LoginUserDto;
import com.example.kadan.dto.RegisterUserDto;
import com.example.kadan.dto.enums.UserStatus;
import com.example.kadan.entity.User;
import com.example.kadan.repository.UserRepository;
import com.example.kadan.service.activity.ActivityEvent;
import com.example.kadan.service.activity.UserActivityLog;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.example.kadan.dto.enums.ActivityType.USER_LOGIN;
import static com.example.kadan.dto.enums.ActivityType.USER_REGISTERED;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final ApplicationEventPublisher publisher;

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


        User savedUser = userRepository.save(user);

        publisher.publishEvent(new ActivityEvent(USER_REGISTERED, new UserActivityLog(savedUser), null, savedUser));

        return savedUser;
    }

    @Transactional
    public User authenticateUser(LoginUserDto loginUserDto) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginUserDto.email(), loginUserDto.password()));

        User loggedInUser = (User) authentication.getPrincipal();

        publisher.publishEvent(new ActivityEvent(USER_LOGIN, new UserActivityLog(loggedInUser), null, loggedInUser));

        return loggedInUser;
    }
}

