package com.blog.blok_api.service;

import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.mapper.PostMapper;
import com.blog.blok_api.model.Comment;
import com.blog.blok_api.model.Like;
import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.User;
import com.blog.blok_api.repository.CommentRepository;
import com.blog.blok_api.repository.LikeRepository;
import com.blog.blok_api.repository.PostRepository;
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
public class LikeServiceImpl implements LikeService {

    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PostMapper postMapper;
    public LikeServiceImpl(LikeRepository likeRepository,
                           PostRepository postRepository,
                           CommentRepository commentRepository,
                           UserRepository userRepository,
                           JwtUtil jwtUtil, PostMapper postMapper) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.postMapper = postMapper;
    }


    @Override
    @Transactional
    public boolean toggleLikePost(Long postId, String token) throws Exception {
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post bulunamadı"));

        return likeRepository.findByUserAndPost(user, post)
                .map(existingLike -> {
                    likeRepository.delete(existingLike);
                    return false; // kaldırıldı
                })
                .orElseGet(() -> {
                    Like like = new Like();
                    like.setUser(user);
                    like.setPost(post);
                    like.setLikedAt(LocalDateTime.now());
                    likeRepository.save(like);
                    return true; // eklendi
                });
    }


    @Override
    @Transactional
    public void likePost(Long postId, String token) throws Exception {
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı"));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post bulunamadı"));

        if (likeRepository.existsByUserAndPost(user, post)) {
            throw new Exception("Zaten beğenmişsin");
        }

        Like like = new Like();
        like.setUser(user);
        like.setPost(post);
        like.setLikedAt(LocalDateTime.now());
        likeRepository.save(like);
    }



    @Override
    public boolean hasUserLikedPost(User user, Post post) {
        return likeRepository.existsByUserAndPost(user, post);
    }

    @Override
    public Long countByPost(Post post) {
        return likeRepository.countByPost(post);
    }



    @Override
    public boolean toggleLikeComment(Long commentId, String token) {

        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + username));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Yorum bulunamadı"));

        Optional<Like> existingLike = likeRepository.findByUserAndComment(user, comment);

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            return false; // beğeni kaldırıldı
        } else {
            Like like = Like.builder()
                    .user(user)
                    .comment(comment)
                    .likedAt(LocalDateTime.now())
                    .build();
            likeRepository.save(like);
            return true; // beğenildi
        }
    }

    @Override
    public Long countByCommentId(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Yorum bulunamadı"));
        return likeRepository.countByComment(comment);
    }


    @Override
    public boolean hasUserLikedComment(User user, Comment comment) {
        return likeRepository.existsByUserAndComment(user, comment);
    }

    @Override
    public Long countByComment(Comment comment) {
        return likeRepository.countByComment(comment);
    }
    @Override
    public int countLikesForPost(Long postId) {
        return likeRepository.countByPostId(postId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDto> getPostsLikedByUser(Long userId) {
        List<Post> likedPosts = likeRepository.findLikedPostsByUserId(userId);
        
        if (likedPosts.isEmpty()) {
            return List.of();
        }
        
        // Post ID'lerini topla
        List<Long> postIds = likedPosts.stream().map(Post::getId).toList();
        
        // Like sayılarını toplu olarak al
        Map<Long, Integer> likeCountMap = new HashMap<>();
        List<Object[]> likeCounts = likeRepository.countLikesByPostIds(postIds);
        for (Object[] result : likeCounts) {
            Long postId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            likeCountMap.put(postId, count.intValue());
        }
        
        // Comment sayılarını toplu olarak al
        Map<Long, Integer> commentCountMap = new HashMap<>();
        List<Object[]> commentCounts = commentRepository.countCommentsByPostIds(postIds);
        for (Object[] result : commentCounts) {
            Long postId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            commentCountMap.put(postId, count.intValue());
        }
        
        return likedPosts.stream()
                .filter(post -> post != null)
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeCountMap.getOrDefault(post.getId(), 0));
                    dto.setLikedByCurrentUser(true);
                    dto.setCommentCount(commentCountMap.getOrDefault(post.getId(), 0));
                    return dto;
                })
                .toList();
    }

}