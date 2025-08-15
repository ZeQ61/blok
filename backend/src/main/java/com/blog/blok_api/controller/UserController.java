package com.blog.blok_api.controller;


import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.dto.ProfileImageResponse;
import com.blog.blok_api.dto.ProfileResponseDto;
import com.blog.blok_api.service.PostService;
import com.blog.blok_api.service.UserService;
import com.blog.blok_api.security.JwtUtil;
import com.blog.blok_api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final PostService postService;

    @Autowired
    public UserController(UserService userService, JwtUtil jwtUtil, UserRepository userRepository, PostService postService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.postService = postService;
    }

    @GetMapping("/profile")
    public ProfileResponseDto getProfile(@RequestHeader("Authorization") String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        return userService.getProfile(token);
    }

    @PutMapping("/profile")
    public ProfileResponseDto updateProfile(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody com.blog.blok_api.dto.ProfileRequestDto profileRequestDto
    ) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        return userService.updateProfile(token, profileRequestDto);
    }


    @PostMapping("/{userId}/profile-image")
    public ResponseEntity<ProfileImageResponse> uploadProfileImage(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) throws IOException {

        String imageUrl = userService.uploadProfileImage(userId, file);
        return ResponseEntity.ok(new ProfileImageResponse(imageUrl));
    }



}
