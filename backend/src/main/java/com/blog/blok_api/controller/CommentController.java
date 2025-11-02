package com.blog.blok_api.controller;

import com.blog.blok_api.dto.CommentRequestDto;
import com.blog.blok_api.dto.CommentResponseDto;
import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.security.CustomUserDetails;
import com.blog.blok_api.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    @Autowired
    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    public CommentResponseDto createComment(@RequestBody CommentRequestDto dto, HttpServletRequest request) throws Exception {
        String token = request.getHeader("Authorization").substring(7);
        return commentService.createComment(token, dto);
    }

    @GetMapping("/post/{postId}")
    public List<CommentResponseDto> getComments(@PathVariable Long postId, HttpServletRequest request) throws Exception {
        String token = request.getHeader("Authorization").substring(7);
        return commentService.getCommentsByPostId(postId, token);
    }

    @DeleteMapping("/delete/comment/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        
        commentService.deleteCommentByIdAndUser(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/user-posts")
    public ResponseEntity<List<PostResponseDto>> getUserCommentedPosts(@AuthenticationPrincipal CustomUserDetails currentUser) {
        Long userId = currentUser.getId();
        List<PostResponseDto> posts = commentService.getPostsUserCommentedOn(userId);
        return ResponseEntity.ok(posts);
    }


}
