package com.blog.blok_api.service;

import com.blog.blok_api.dto.ProfileRequestDto;
import com.blog.blok_api.dto.ProfileResponseDto;
import com.blog.blok_api.dto.RegisterRequestDto;
import com.blog.blok_api.dto.RegisterResponseDto;
import com.blog.blok_api.model.User;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface UserService {
    ProfileResponseDto getProfile(String token) throws Exception;
    ProfileResponseDto updateProfile(String token, ProfileRequestDto profileRequestDto) throws Exception;

    String uploadProfileImage(Long userId, MultipartFile file) throws IOException;
}
