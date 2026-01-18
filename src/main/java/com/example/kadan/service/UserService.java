package com.example.kadan.service;

import com.example.kadan.dto.UpdateUserProfileDto;
import com.example.kadan.dto.UserProfileDto;
import com.example.kadan.entity.User;
import com.example.kadan.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
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
    public UserProfileDto updateUserProfile(User currentUser, UpdateUserProfileDto updateDto) {
        if (updateDto.email() != null) {
            currentUser.setEmail(updateDto.email());
        }
        if (updateDto.displayName() != null) {
            currentUser.setDisplayName(updateDto.displayName());
        }
        if (updateDto.defaultCurrency() != null) {
            currentUser.setDefaultCurrency(updateDto.defaultCurrency());
        }

        User updatedUser = userRepository.save(currentUser);
        return UserProfileDto.fromEntity(updatedUser);
    }

    public UserProfileDto getUserById(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        return UserProfileDto.fromEntity(user);
    }
}

