package com.blog.blok_api.service;

import com.blog.blok_api.dto.AdminPostResponseDto;
import com.blog.blok_api.dto.AdminUserResponseDto;
import org.springframework.data.domain.Page; // ✅
import org.springframework.data.domain.Pageable; // ✅

public interface AdminService {
    Page<AdminUserResponseDto> getAllUsers(String q, Pageable pageable);
    Page<AdminPostResponseDto> getAllPosts(String q, Pageable pageable);
    void deleteUserById(Long userId);


}
