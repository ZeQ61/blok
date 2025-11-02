package com.blog.blok_api.controller;

import com.blog.blok_api.dto.CategoryDto;
import com.blog.blok_api.dto.PostRequestDto;
import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.dto.TagDto;
import com.blog.blok_api.security.JwtUtil;
import com.blog.blok_api.repository.CategoryRepository;
import com.blog.blok_api.repository.TagRepository;
import com.blog.blok_api.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.io.IOException;


@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final JwtUtil jwtUtil;

    @Autowired
    public PostController(PostService postService, CategoryRepository categoryRepository, TagRepository tagRepository, JwtUtil jwtUtil) {
        this.postService = postService;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<PostResponseDto> createPost(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody PostRequestDto postRequestDto
    ) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        PostResponseDto response = postService.createPost(token, postRequestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostResponseDto> getPostById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long id
    ) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        PostResponseDto response = postService.getPostById(id, token);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<PostResponseDto>> getAllPosts(
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.replace("Bearer ", "");
        List<PostResponseDto> posts = postService.getAllPosts(token);
        return ResponseEntity.ok(posts);
    }


    @GetMapping("/me")
    public ResponseEntity<List<PostResponseDto>> getMyPosts(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");
        List<PostResponseDto> myPosts = postService.getMyPosts(token);
        return ResponseEntity.ok(myPosts);
    }

    @DeleteMapping("/posts/delete/{id}")
    public ResponseEntity<?> deleteUserPost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    )throws Exception{
        String token = authHeader.replace("Bearer ", "");
        Long userId = jwtUtil.extractUserId(token);
        postService.deletePostByIdAndUser(id,userId);
        return ResponseEntity.ok("Post başarıyla silindi.");
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        List<CategoryDto> categories = categoryRepository.findAll().stream().map(cat -> {
            CategoryDto dto = new CategoryDto();
            dto.setId(cat.getId());
            dto.setName(cat.getName());
            dto.setSlug(cat.getSlug());
            dto.setDescription(cat.getDescription());
            return dto;
        }).toList();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/tags")
    public ResponseEntity<List<TagDto>> getTags() {
        List<TagDto> tags = tagRepository.findAll().stream().map(tag -> {
            TagDto dto = new TagDto();
            dto.setId(tag.getId());
            dto.setName(tag.getName());
            dto.setSlug(tag.getSlug());
            return dto;
        }).toList();
        return ResponseEntity.ok(tags);
    }

    @GetMapping("/top-liked")
    public ResponseEntity<List<PostResponseDto>> getTop5LikedPosts(
            @RequestHeader(name = "Authorization", required = false) String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7); // "Bearer " prefixini sil
        }
        List<PostResponseDto> topPosts = postService.getTop5MostLikedPosts(token);
        return ResponseEntity.ok(topPosts);
    }

    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadPostImage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        String token = authHeader.replace("Bearer ", "");
        String imageUrl = postService.uploadPostImage(token, file);
        return ResponseEntity.ok(imageUrl);
    }

    @PostMapping("/upload-media")
    public ResponseEntity<String> uploadPostMedia(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        String token = authHeader.replace("Bearer ", "");
        String mediaUrl = postService.uploadPostMedia(token, file);
        return ResponseEntity.ok(mediaUrl);
    }

} 