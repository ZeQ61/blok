package com.blog.blok_api.service;

import com.blog.blok_api.dto.CommentRequestDto;
import com.blog.blok_api.dto.CommentResponseDto;
import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.dto.UserDto;
import com.blog.blok_api.mapper.PostMapper;
import com.blog.blok_api.model.*;
import com.blog.blok_api.repository.CommentRepository;
import com.blog.blok_api.repository.LikeRepository;
import com.blog.blok_api.repository.PostRepository;
import com.blog.blok_api.repository.UserRepository;
import com.blog.blok_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final LikeService likeService;
    private final LikeRepository likeRepository;
    private final PostMapper postMapper;

    @Autowired
    public CommentServiceImpl(CommentRepository commentRepository,
                              PostRepository postRepository,
                              UserRepository userRepository,
                              JwtUtil jwtUtil,
                              LikeService likeService, LikeRepository likeRepository, PostMapper postMapper) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.likeService = likeService;
        this.likeRepository = likeRepository;
        this.postMapper = postMapper;
    }

    @Override
    public CommentResponseDto createComment(String token, CommentRequestDto dto) throws Exception {
        Long userId = jwtUtil.extractUserId(token);
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı"));
        Post post = postRepository.findById(dto.getPostId())
                .orElseThrow(() -> new Exception("Post bulunamadı"));

        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());
        comment.setDeleted(false);

        if (dto.getParentCommentId() != null) {
            Comment parent = commentRepository.findById(dto.getParentCommentId())
                    .orElseThrow(() -> new Exception("Üst yorum bulunamadı"));
            comment.setParentComment(parent);
        }

        Comment saved = commentRepository.save(comment);
        return toDto(saved, author);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CommentResponseDto> getCommentsByPostId(Long postId, String token) throws Exception {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new Exception("Post bulunamadı"));

        Optional<User> currentUserOptional;
        try {
            Long userId = jwtUtil.extractUserId(token);
            currentUserOptional = userRepository.findById(userId);
        } catch (Exception ignored) {
            currentUserOptional = Optional.empty();
        }
        final User currentUser = currentUserOptional.orElse(null);

        List<Comment> topLevelComments = commentRepository.findByPostAndIsDeletedFalse(post).stream()
                .filter(c -> c.getParentComment() == null)
                .collect(Collectors.toList());

        return topLevelComments.stream()
                .map(c -> toDto(c, currentUser))
                .collect(Collectors.toList());
    }


    private CommentResponseDto toDto(Comment comment, User currentUser) {
        CommentResponseDto dto = new CommentResponseDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setDeleted(comment.isDeleted());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());

        UserDto author = new UserDto();
        author.setId(comment.getAuthor().getId());
        author.setUsername(comment.getAuthor().getUsername());
        author.setProfileImgUrl(comment.getAuthor().getProfileImgUrl());
        dto.setAuthor(author);

        dto.setLikeCount(likeService.countByComment(comment).intValue());
        dto.setLikedByCurrentUser(currentUser != null && likeService.hasUserLikedComment(currentUser, comment));

        List<CommentResponseDto> replies = comment.getReplies() != null
                ? comment.getReplies().stream()
                .filter(r -> !r.isDeleted())
                .map(reply -> toDto(reply, currentUser))
                .collect(Collectors.toList())
                : List.of();

        dto.setReplies(replies);
        return dto;
    }

    @Override
    @Transactional
    public void deleteCommentByIdAndUser(Long commentId, Long userId) {
        Comment comment = commentRepository.findByIdAndAuthorId(commentId, userId)
                .orElseThrow(() -> new SecurityException("Yorum size ait değil veya bulunamadı."));

        // 1. Yoruma ait like'ları sil
        likeRepository.deleteAllByCommentIdIn(List.of(commentId));

        // 2. Yorumu sil
        commentRepository.delete(comment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDto> getPostsUserCommentedOn(Long userId) {
        List<Post> posts = commentRepository.findDistinctPostsByAuthorId(userId);
        
        if (posts.isEmpty()) {
            return List.of();
        }
        
        User currentUser = userRepository.findById(userId).orElse(null);
        
        // Post ID'lerini topla
        List<Long> postIds = posts.stream().map(Post::getId).toList();
        
        // Like sayılarını toplu olarak al
        Map<Long, Integer> likeCountMap = new HashMap<>();
        List<Object[]> likeCounts = likeRepository.countLikesByPostIds(postIds);
        for (Object[] result : likeCounts) {
            Long postId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            likeCountMap.put(postId, count.intValue());
        }
        
        // Kullanıcının beğendiği postları toplu olarak al
        Set<Long> likedPostIds = currentUser != null 
                ? new HashSet<>(likeRepository.findLikedPostIdsByUserAndPosts(userId, postIds))
                : Set.of();
        
        // Comment sayılarını toplu olarak al
        Map<Long, Integer> commentCountMap = new HashMap<>();
        List<Object[]> commentCounts = commentRepository.countCommentsByPostIds(postIds);
        for (Object[] result : commentCounts) {
            Long postId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            commentCountMap.put(postId, count.intValue());
        }
        
        return posts.stream()
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeCountMap.getOrDefault(post.getId(), 0));
                    dto.setLikedByCurrentUser(likedPostIds.contains(post.getId()));
                    dto.setCommentCount(commentCountMap.getOrDefault(post.getId(), 0));
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
