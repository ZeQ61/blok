package com.blog.blok_api.service;

import com.blog.blok_api.dto.PostResponseDto;

import java.util.List;

public interface SavedPostService {
    boolean toggleSavePost(Long postId, String token) throws Exception;
    boolean isPostSavedByUser(Long postId, String token) throws Exception;
    List<PostResponseDto> getSavedPostsByUser(String token) throws Exception;
}

