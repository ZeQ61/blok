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

    /**
     * Toplu post görüntülenme takibi
     * Kullanıcının ekranda görünen postları için görüntülenme sayısını artırır
     * Aynı kullanıcı aynı postu tekrar görüntülediğinde sayılmaz
     * 
     * @param token JWT token
     * @param postIds Ekranda görünen post ID'leri
     * @throws Exception Kullanıcı bulunamadığında
     */
    @Transactional
    void trackMultiplePostViews(String token, List<Long> postIds) throws Exception;
}