package com.blog.blok_api.controller;

import com.blog.blok_api.dto.LikeCountResponse;
import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.dto.ToggleLikeResponse;
import com.blog.blok_api.security.CustomUserDetails;
import com.blog.blok_api.service.LikeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/like")
public class LikeController {

    private final LikeService likeService;

    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @GetMapping("/post/{postId}/count")
    public ResponseEntity<?> getLikeCount(@PathVariable Long postId) {
        int likeCount = likeService.countLikesForPost(postId);
        return ResponseEntity.ok(new LikeCountResponse(postId, likeCount));

    }



    @PatchMapping("/post/{postId}/toggle")
    public ResponseEntity<?> toggleLikePost(@PathVariable Long postId, HttpServletRequest request) throws Exception {
        String token = extractToken(request);
        boolean liked = likeService.toggleLikePost(postId, token);

        String message = liked ? "Post beğenildi" : "Beğeni kaldırıldı";
        return ResponseEntity.ok(new ToggleLikeResponse(postId, liked, message));

    }

    @PatchMapping("/comment/{commentId}/toggle")
    public ResponseEntity<?> toggleLikeComment(@PathVariable Long commentId, HttpServletRequest request) throws Exception {
        String token = extractToken(request);
        boolean liked = likeService.toggleLikeComment(commentId, token);
        if (liked) {
            return ResponseEntity.ok("Yorum beğenildi");
        } else {
            return ResponseEntity.ok("Beğeni kaldırıldı");
        }
    }

    @GetMapping("/comment/{commentId}/count")
    public ResponseEntity<?> getCommentLikeCount(@PathVariable Long commentId) {
        Long count = likeService.countByCommentId(commentId);
        return ResponseEntity.ok(count);
    }



    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        return header != null && header.startsWith("Bearer ") ? header.substring(7) : "";
    }


    @GetMapping("/my-liked-posts")
    public ResponseEntity<List<PostResponseDto>> getLikedPostsByCurrentUser(
            @AuthenticationPrincipal CustomUserDetails currentUser) {

        List<PostResponseDto> likedPosts = likeService.getPostsLikedByUser(currentUser.getId());
        return ResponseEntity.ok(likedPosts);
    }
}
