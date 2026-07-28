package com.smartdocs.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
) {}

record AuthResponse(
        String token,
        UserDto user
) {}

record UserDto(
        Long id,
        String email,
        String name,
        String role,
        String initials
) {
    static UserDto from(User u) {
        String initials = u.getName().chars()
                .filter(Character::isUpperCase)
                .limit(2)
                .collect(StringBuilder::new,
                        (sb, c) -> sb.append((char) c),
                        StringBuilder::append)
                .toString();

        if (initials.isEmpty()) {
            initials = u.getName().substring(0, 1).toUpperCase();
        }

        return new UserDto(
                u.getId(), u.getEmail(),
                u.getName(), u.getRole(), initials);
    }
}
