package com.blog.blok_api.service;

import com.blog.blok_api.dto.*;
import com.blog.blok_api.model.Role;
import com.blog.blok_api.model.User;
import com.blog.blok_api.repository.RoleRepository;
import com.blog.blok_api.repository.UserRepository;
import com.blog.blok_api.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;
        private final AuthenticationManager authenticationManager;
        private final JwtUtil jwtUtil;

        public AuthServiceImpl(UserRepository userRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder,
                               JwtUtil jwtUtil,
                               AuthenticationManager authenticationManager) {
                this.userRepository = userRepository;
                this.roleRepository = roleRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtil = jwtUtil;
                this.authenticationManager = authenticationManager;
        }

        @Override
        @Transactional
        public RegisterResponseDto register(RegisterRequestDto registerRequestDto) {
                if (userRepository.existsByUsername(registerRequestDto.getUsername())) {
                        throw new RuntimeException("Bu Kullanıcı Adı Zaten Kullanılıyor");
                }

                if (userRepository.existsByEmail(registerRequestDto.getEmail())) {
                        throw new RuntimeException("Bu Email Adresi Zaten Kayıtlı");
                }

                Role userRole = roleRepository.findByName("USER")
                        .orElseThrow(() -> new RuntimeException("USER rolü bulunamadı."));

                User newUser = User.builder()
                        .username(registerRequestDto.getUsername())
                        .email(registerRequestDto.getEmail())
                        .hashedPassword(passwordEncoder.encode(registerRequestDto.getPassword()))
                        .profileImgUrl(registerRequestDto.getProfileImgUrl())
                        .bio(registerRequestDto.getBio())
                        .isOnline(false)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .role(userRole)
                        .build();

                User savedUser = userRepository.save(newUser);

                return RegisterResponseDto.builder()
                        .id(savedUser.getId())
                        .username(savedUser.getUsername())
                        .email(savedUser.getEmail())
                        .profileImgUrl(savedUser.getProfileImgUrl())
                        .bio(savedUser.getBio())
                        .isOnline(savedUser.isOnline())
                        .createdAt(savedUser.getCreatedAt())
                        .updatedAt(savedUser.getUpdatedAt())
                        .roleName(savedUser.getRole().getName())
                        .build();
        }

        @Override
        @Transactional
        public LoginResponseDto login(LoginRequestDto loginRequestDto) {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                loginRequestDto.getUsername(),
                                loginRequestDto.getPassword()
                        )
                );

                User user = userRepository.findByUsername(loginRequestDto.getUsername())
                        .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

                user.setOnline(true);
                userRepository.save(user);

                String token = jwtUtil.generateToken(
                        user.getUsername(),
                        user.getId(),
                        List.of(user.getRole().getName())
                );

                return LoginResponseDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .roleName(user.getRole().getName())
                        .isOnline(true)
                        .token(token)
                        .build();
        }

        @Override
        @Transactional
        public String forgotPassword(ForgotPasswordRequestDto forgotPasswordRequestDto) throws Exception {
                String email = forgotPasswordRequestDto.getEmail();
                if (email == null || email.isBlank()) {
                        throw new IllegalArgumentException("Email zorunludur.");
                }

                User user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new Exception("Bu email ile kayıtlı kullanıcı bulunamadı."));

                String newPassword = UUID.randomUUID().toString().substring(0, 8);
                user.setHashedPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);

                // TODO: E-posta gönderme işlemi burada yapılmalı
                return newPassword;
        }
}
