package com.blog.blok_api.service;

import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.mapper.PostMapper;
import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.SavedPost;
import com.blog.blok_api.model.User;
import com.blog.blok_api.repository.LikeRepository;
import com.blog.blok_api.repository.PostRepository;
import com.blog.blok_api.repository.SavedPostRepository;
import com.blog.blok_api.repository.UserRepository;
import com.blog.blok_api.security.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SavedPostServiceImpl implements SavedPostService {

    private final SavedPostRepository savedPostRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PostMapper postMapper;
    private final LikeRepository likeRepository;

    public SavedPostServiceImpl(SavedPostRepository savedPostRepository,
                                PostRepository postRepository,
                                UserRepository userRepository,
                                JwtUtil jwtUtil,
                                PostMapper postMapper,
                                LikeRepository likeRepository) {
        this.savedPostRepository = savedPostRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.postMapper = postMapper;
        this.likeRepository = likeRepository;
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
    @Transactional
    public List<PostResponseDto> getSavedPostsByUser(String token) throws Exception {
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı"));

        List<Post> savedPosts = savedPostRepository.findSavedPostsByUserId(userId);
        return savedPosts.stream()
                .filter(post -> post != null)
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeRepository.countByPostId(post.getId()));
                    dto.setLikedByCurrentUser(likeRepository.existsByUserAndPost(user, post));
                    dto.setCommentCount(post.getComments() != null ? (int) post.getComments().stream().filter(c -> !c.isDeleted()).count() : 0);
                    return dto;
                })
                .toList();
    }
}

