package com.sambit.sampharixErp.modules.auth.service;

import com.sambit.sampharixErp.modules.auth.dto.AuthResponse;
import com.sambit.sampharixErp.modules.auth.dto.LoginRequest;
import com.sambit.sampharixErp.modules.auth.dto.RegisterRequest;

import com.sambit.sampharixErp.security.jwt.JwtService;

import com.sambit.sampharixErp.modules.user.entity.User;
import com.sambit.sampharixErp.modules.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    // =====================================
    // REGISTER
    // =====================================
    // =====================================
    // REGISTER
    // =====================================
    public User register(RegisterRequest request) {
        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            throw new RuntimeException("Mobile number is mandatory for registration!");
        }

        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("Please provide a valid email address!");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists in the system!");
        }

        boolean isAutoApproved = request.getRole() == com.sambit.sampharixErp.modules.user.entity.Role.ADMIN;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .phone(request.getPhone())
                .address(request.getAddress())
                .active(isAutoApproved)
                .build();

        return userRepository.save(user);
    }

    // =====================================
    // LOGIN
    // =====================================
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid Email or Password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid Email or Password");
        }

        // NEW: Block login if the account is not approved
        if (user.getActive() == null || !user.getActive()) {
            throw new RuntimeException("Your account is pending Admin approval.");
        }

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .name(user.getName()) // Send the name to React
                .build();
    }
}