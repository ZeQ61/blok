package com.blog.blok_api.service;

import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.model.Comment;
import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.User;

import java.util.List;

public interface LikeService {
    void likePost(Long postId, String token) throws Exception;
    boolean hasUserLikedPost(User user, Post post);
    Long countByPost(Post post);

    boolean toggleLikeComment(Long commentId, String token);
    Long countByCommentId(Long commentId);


    boolean hasUserLikedComment(User user, Comment comment);
    Long countByComment(Comment comment);
    boolean toggleLikePost(Long postId, String token) throws Exception;
    int countLikesForPost(Long postId);


    List<PostResponseDto> getPostsLikedByUser(Long id);
}

