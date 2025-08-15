package com.blog.blok_api.controller;

import com.blog.blok_api.dto.*;
import com.blog.blok_api.model.User;
import com.blog.blok_api.model.Role;
import com.blog.blok_api.repository.UserRepository;
import com.blog.blok_api.security.JwtUtil;
import com.blog.blok_api.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {


    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;



    @Autowired
    public AuthController (AuthService authService, JwtUtil jwtUtil, UserRepository userRepository, AuthenticationManager authenticationManager){
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
    }


    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@Valid @RequestBody RegisterRequestDto registerRequestDto) throws Exception{
        RegisterResponseDto response = authService.register(registerRequestDto);
            return ResponseEntity.ok(response);
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequestDto) throws Exception{
        LoginResponseDto response = authService.login(loginRequestDto);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDto forgotPasswordRequestDto) {
        try {
            String newPassword = authService.forgotPassword(forgotPasswordRequestDto);
            return ResponseEntity.ok("Yeni şifreniz: " + newPassword + "\nLütfen giriş yaptıktan sonra şifrenizi değiştirin.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<TokenResponseDto> adminLogin(@RequestBody @Valid LoginRequestDto request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı"));

        if (!"ADMIN".equals(user.getRole().getName())) {
            throw new AccessDeniedException("Sadece admin giriş yapabilir.");
        }

        // ROL claim'li JWT üretimi
        String token = jwtUtil.generateToken(
                user.getUsername(),
                user.getId(),
                List.of(user.getRole().getName()) // örneğin "ADMIN"
        );

        return ResponseEntity.ok(new TokenResponseDto(token));
    }



}
