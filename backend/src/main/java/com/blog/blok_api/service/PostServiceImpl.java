package com.blog.blok_api.service;

import com.blog.blok_api.dto.PostRequestDto;
import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.mapper.PostMapper;
import com.blog.blok_api.model.*;
import com.blog.blok_api.repository.*;
import com.blog.blok_api.security.JwtUtil;
import com.blog.blok_api.util.SlugUtil;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.io.IOException;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final JwtUtil jwtUtil;
    private final PostMapper postMapper;
    private final LikeService likeService;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final Cloudinary cloudinary;

    public PostServiceImpl(PostRepository postRepository,
                           UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           TagRepository tagRepository,
                           JwtUtil jwtUtil,
                           PostMapper postMapper,
                           LikeService likeService, LikeRepository likeRepository, CommentRepository commentRepository, Cloudinary cloudinary) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.jwtUtil = jwtUtil;
        this.postMapper = postMapper;
        this.likeService = likeService;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.cloudinary = cloudinary;
    }

    @Override
    public PostResponseDto createPost(String token, PostRequestDto dto) throws Exception {
        Long userId = jwtUtil.extractUserId(token);
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı."));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new Exception("Kategori bulunamadı."));

        Set<Tag> tags = dto.getTagIds() != null
                ? dto.getTagIds().stream()
                .map(id -> tagRepository.findById(id).orElse(null))
                .filter(tag -> tag != null)
                .collect(Collectors.toSet())
                : Set.of();

        Post post = postMapper.toEntity(dto);
        post.setCategory(category);
        post.setTags(tags);
        post.setAuthor(author);
        post.setSlug(SlugUtil.generateUniqueSlug(dto.getTitle()));
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        post.setPublished(true);
        post.setViewsCount(0);

        Post saved = postRepository.save(post);
        PostResponseDto responseDto = postMapper.toDto(saved);
        responseDto.setLikeCount(0); // Yeni post, henüz like yok
        responseDto.setLikedByCurrentUser(false);
        return responseDto;
    }

    @Override
    public PostResponseDto getPostById(Long id, String token) throws Exception {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new Exception("Post bulunamadı."));

        User currentUser = null;
        if (token != null && !token.isBlank()) {
            try {
                Long userId = jwtUtil.extractUserId(token);
                currentUser = userRepository.findById(userId).orElse(null);
            } catch (Exception ignored) {
            }
        }

        PostResponseDto dto = postMapper.toDto(post);
        dto.setLikeCount(likeService.countByPost(post).intValue());
        dto.setLikedByCurrentUser(currentUser != null && likeService.hasUserLikedPost(currentUser, post));
        dto.setCommentCount(post.getComments() != null ? (int) post.getComments().stream().filter(c -> !c.isDeleted()).count() : 0);
        return dto;
    }

    @Override
    public List<PostResponseDto> getAllPosts(String token) {
        User currentUser = null;
        if (token != null && !token.isBlank()) {
            try {
                Long userId = jwtUtil.extractUserId(token);
                currentUser = userRepository.findById(userId).orElse(null);
            } catch (Exception ignored) {
            }
        }

        final User finalCurrentUser = currentUser;

        // En yeni postları önce getirmek için createdAt'e göre DESC sıralama
        return postRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeService.countByPost(post).intValue());
                    dto.setLikedByCurrentUser(finalCurrentUser != null && likeService.hasUserLikedPost(finalCurrentUser, post));
                    dto.setCommentCount(post.getComments() != null ? (int) post.getComments().stream().filter(c -> !c.isDeleted()).count() : 0);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<PostResponseDto> getMyPosts(String token) {
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı"));

        // Kullanıcının postlarını en yeni önce getirmek için createdAt'e göre DESC sıralama
        List<Post> posts = postRepository.findAllByAuthorOrderByCreatedAtDesc(user);

        final User finalCurrentUser = user;
        return posts.stream()
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeService.countByPost(post).intValue());
                    dto.setLikedByCurrentUser(finalCurrentUser != null && likeService.hasUserLikedPost(finalCurrentUser, post));
                    dto.setCommentCount(post.getComments() != null ? (int) post.getComments().stream().filter(c -> !c.isDeleted()).count() : 0);
                    return dto;
                })
                .collect(Collectors.toList());
    }


    @Override
    @Transactional
    public void deletePostByIdAndUser(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post bulunamadı."));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new SecurityException("Bu postu silme yetkiniz yok.");
        }

        // 1. Posta ait yorumları bul

        List<Comment> comments = commentRepository.findAllByPostId(postId);
        List<Long> commentIds = comments.stream()
                .map(Comment::getId)
                .toList();

        // 2. Yorumlara ait like'ları sil
        if (!commentIds.isEmpty()) {
            likeRepository.deleteAllByCommentIdIn(commentIds);
        }

        // 3. Posta ait like'ları sil
        likeRepository.deleteAllByPostId(postId);

        // 4. En son post'u sil
        postRepository.delete(post);
    }


    @Override
    @Transactional
    public List<PostResponseDto> getTop5MostLikedPosts(String token) {
        Pageable top5 = (Pageable) PageRequest.of(0, 5);

        List<Post> topPosts = postRepository.findTop5MostLikedPosts(top5);

        User currentUser = null;
        if (token != null && !token.isBlank()) {
            try {
                Long userId = jwtUtil.extractUserId(token);
                currentUser = userRepository.findById(userId).orElse(null);
            } catch (Exception ignored) {
            }
        }

        final User finalCurrentUser = currentUser;

        return topPosts.stream()
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeService.countByPost(post).intValue());
                    dto.setLikedByCurrentUser(finalCurrentUser != null && likeService.hasUserLikedPost(finalCurrentUser, post));
                    dto.setCommentCount(post.getComments() != null ? (int) post.getComments().stream().filter(c -> !c.isDeleted()).count() : 0);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public String uploadPostImage(String token, MultipartFile file) throws IOException {
        // Token'dan kullanıcı ID'sini al
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı: " + userId));

        // Dosya tipi kontrolü
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Sadece resim dosyaları yüklenebilir!");
        }

        try {
            // Cloudinary'e yükle
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", "post_images",
                    "public_id", "post_" + userId + "_" + UUID.randomUUID(),
                    "overwrite", false,
                    "resource_type", "image"
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String imageUrl = (String) uploadResult.get("secure_url");

            // Image URL'yi döndür
            return imageUrl;
        } catch (Exception e) {
            throw new IOException("Görsel yükleme hatası: " + e.getMessage(), e);
        }
    }

    @Override
    public String uploadPostMedia(String token, MultipartFile file) throws IOException {
        // Token'dan kullanıcı ID'sini al
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı: " + userId));

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("Dosya tipi belirlenemedi!");
        }

        String resourceType;
        String folder;
        
        // Dosya tipine göre resource type ve folder belirle
        if (contentType.startsWith("image/")) {
            resourceType = "image";
            folder = "post_images";
        } else if (contentType.startsWith("video/")) {
            resourceType = "video";
            folder = "post_videos";
        } else {
            throw new IllegalArgumentException("Sadece resim ve video dosyaları yüklenebilir! Desteklenen format: " + contentType);
        }

        try {
            // Cloudinary'e yükle
            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "public_id", "post_" + userId + "_" + UUID.randomUUID(),
                    "overwrite", false,
                    "resource_type", resourceType
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String mediaUrl = (String) uploadResult.get("secure_url");

            // Media URL'yi döndür
            return mediaUrl;
        } catch (Exception e) {
            throw new IOException("Medya yükleme hatası: " + e.getMessage(), e);
        }
    }

}
