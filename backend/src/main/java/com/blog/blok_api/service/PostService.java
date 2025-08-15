package com.blog.blok_api.service;

import com.blog.blok_api.dto.PostRequestDto;
import com.blog.blok_api.dto.PostResponseDto;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface PostService {
    PostResponseDto createPost(String token, PostRequestDto postRequestDto) throws Exception;
    PostResponseDto getPostById(Long id, String token) throws Exception;
    List<PostResponseDto> getAllPosts(String token);
    List<PostResponseDto> getMyPosts(String token);

    @Transactional
    void deletePostByIdAndUser(Long postId, Long userId);

    List<PostResponseDto> getTop5MostLikedPosts(String token);
}