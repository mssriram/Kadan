package com.example.kadan.service;

import com.example.kadan.dto.UpdateUserProfileDto;
import com.example.kadan.dto.UserProfileDto;
import com.example.kadan.entity.User;
import com.example.kadan.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

//    public UserProfileDto getCurrentUserProfile(User currentUser) {
//        return UserProfileDto.fromEntity(currentUser);
//    }

    @Transactional
    public UserProfileDto updateUserProfile(UUID currentUser, UpdateUserProfileDto updateDto) {
        User user = userRepository.findById(currentUser).orElseThrow(() -> new EntityNotFoundException("User not found"));
        if (updateDto.email() != null) {
            user.setEmail(updateDto.email());
        }
        if (updateDto.displayName() != null) {
            user.setDisplayName(updateDto.displayName());
        }
        if (updateDto.defaultCurrency() != null) {
            user.setDefaultCurrency(updateDto.defaultCurrency());
        }

        if (userRepository.findByEmail(updateDto.email()).isPresent()) {
            throw new DataIntegrityViolationException("Email already in use");
        }

        User updatedUser = userRepository.save(user);
        return UserProfileDto.fromEntity(updatedUser);
    }

    @Transactional
    public UserProfileDto getUserById(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        return UserProfileDto.fromEntity(user);
    }
}

