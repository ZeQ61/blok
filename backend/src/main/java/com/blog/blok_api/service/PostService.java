package com.blog.blok_api.service;

import com.blog.blok_api.dto.PostRequestDto;
import com.blog.blok_api.dto.PostResponseDto;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.io.IOException;

public interface PostService {
    PostResponseDto createPost(String token, PostRequestDto postRequestDto) throws Exception;
    PostResponseDto getPostById(Long id, String token) throws Exception;
    List<PostResponseDto> getAllPosts(String token);
    List<PostResponseDto> getMyPosts(String token);

    @Transactional
    void deletePostByIdAndUser(Long postId, Long userId);

    List<PostResponseDto> getTop5MostLikedPosts(String token);
    String uploadPostImage(String token, MultipartFile file) throws IOException;
    String uploadPostMedia(String token, MultipartFile file) throws IOException;
    boolean trackPostView(Long postId, String token) throws Exception;
}