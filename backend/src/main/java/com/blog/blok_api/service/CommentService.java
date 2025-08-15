package com.blog.blok_api.service;

import com.blog.blok_api.dto.CommentRequestDto;
import com.blog.blok_api.dto.CommentResponseDto;
import com.blog.blok_api.dto.PostResponseDto;

import java.util.List;

public interface CommentService {
    CommentResponseDto createComment(String token, CommentRequestDto dto) throws Exception;
    List<CommentResponseDto> getCommentsByPostId(Long postId, String token) throws Exception;
    void deleteCommentByIdAndUser(Long commentId, Long userId);
    List<PostResponseDto> getPostsUserCommentedOn(Long userId);
}
