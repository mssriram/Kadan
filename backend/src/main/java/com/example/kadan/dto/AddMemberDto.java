package com.example.kadan.dto;

import jakarta.validation.constraints.Email;

public record AddMemberDto(
        @Email(message = "Invalid Email format")
        String email
) {
}
