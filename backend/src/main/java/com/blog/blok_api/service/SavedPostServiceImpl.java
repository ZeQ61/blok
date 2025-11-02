package com.blog.blok_api.service;

import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.mapper.PostMapper;
import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.SavedPost;
import com.blog.blok_api.model.User;
import com.blog.blok_api.repository.CommentRepository;
import com.blog.blok_api.repository.LikeRepository;
import com.blog.blok_api.repository.PostRepository;
import com.blog.blok_api.repository.SavedPostRepository;
import com.blog.blok_api.repository.UserRepository;
import com.blog.blok_api.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class SavedPostServiceImpl implements SavedPostService {

    private final SavedPostRepository savedPostRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PostMapper postMapper;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public SavedPostServiceImpl(SavedPostRepository savedPostRepository,
                                PostRepository postRepository,
                                UserRepository userRepository,
                                JwtUtil jwtUtil,
                                PostMapper postMapper,
                                LikeRepository likeRepository,
                                CommentRepository commentRepository) {
        this.savedPostRepository = savedPostRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.postMapper = postMapper;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    @Override
    @Transactional
    public boolean toggleSavePost(Long postId, String token) throws Exception {
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post bulunamadı"));

        Optional<SavedPost> existingSavedPost = savedPostRepository.findByUserAndPost(user, post);

        if (existingSavedPost.isPresent()) {
            savedPostRepository.delete(existingSavedPost.get());
            return false; // kayıt kaldırıldı
        } else {
            SavedPost savedPost = new SavedPost();
            savedPost.setUser(user);
            savedPost.setPost(post);
            savedPost.setCreatedAt(LocalDateTime.now());
            savedPostRepository.save(savedPost);
            return true; // kayıt eklendi
        }
    }

    @Override
    public boolean isPostSavedByUser(Long postId, String token) throws Exception {
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post bulunamadı"));

        return savedPostRepository.existsByUserAndPost(user, post);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDto> getSavedPostsByUser(String token) throws Exception {
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı"));

        List<Post> savedPosts = savedPostRepository.findSavedPostsByUserId(userId);
        
        if (savedPosts.isEmpty()) {
            return List.of();
        }
        
        // Post ID'lerini topla
        List<Long> postIds = savedPosts.stream().map(Post::getId).toList();
        
        // Like sayılarını toplu olarak al
        Map<Long, Integer> likeCountMap = new HashMap<>();
        List<Object[]> likeCounts = likeRepository.countLikesByPostIds(postIds);
        for (Object[] result : likeCounts) {
            Long postId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            likeCountMap.put(postId, count.intValue());
        }
        
        // Kullanıcının beğendiği postları toplu olarak al
        Set<Long> likedPostIds = new HashSet<>(likeRepository.findLikedPostIdsByUserAndPosts(userId, postIds));
        
        // Comment sayılarını toplu olarak al
        Map<Long, Integer> commentCountMap = new HashMap<>();
        List<Object[]> commentCounts = commentRepository.countCommentsByPostIds(postIds);
        for (Object[] result : commentCounts) {
            Long postId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            commentCountMap.put(postId, count.intValue());
        }

        return savedPosts.stream()
                .filter(post -> post != null)
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeCountMap.getOrDefault(post.getId(), 0));
                    dto.setLikedByCurrentUser(likedPostIds.contains(post.getId()));
                    dto.setCommentCount(commentCountMap.getOrDefault(post.getId(), 0));
                    return dto;
                })
                .toList();
    }
}

