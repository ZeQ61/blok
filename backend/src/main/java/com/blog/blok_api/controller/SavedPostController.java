package com.blog.blok_api.controller;

import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.dto.ToggleLikeResponse;
import com.blog.blok_api.service.SavedPostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-posts")
public class SavedPostController {

    private final SavedPostService savedPostService;

    public SavedPostController(SavedPostService savedPostService) {
        this.savedPostService = savedPostService;
    }

    @PatchMapping("/post/{postId}/toggle")
    public ResponseEntity<?> toggleSavePost(@PathVariable Long postId, 
                                           @RequestHeader("Authorization") String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        boolean saved = savedPostService.toggleSavePost(postId, token);

        String message = saved ? "Post kaydedildi" : "Kayıt kaldırıldı";
        return ResponseEntity.ok(new ToggleLikeResponse(postId, saved, message));
    }

    @GetMapping("/post/{postId}/status")
    public ResponseEntity<?> isPostSaved(@PathVariable Long postId,
                                         @RequestHeader("Authorization") String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        boolean isSaved = savedPostService.isPostSavedByUser(postId, token);
        return ResponseEntity.ok(isSaved);
    }

    @GetMapping("/my-saved-posts")
    public ResponseEntity<List<PostResponseDto>> getSavedPostsByUser(
            @RequestHeader("Authorization") String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        List<PostResponseDto> savedPosts = savedPostService.getSavedPostsByUser(token);
        return ResponseEntity.ok(savedPosts);
    }
}

