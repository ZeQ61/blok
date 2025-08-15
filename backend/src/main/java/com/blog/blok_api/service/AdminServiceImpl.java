package com.blog.blok_api.service;

import com.blog.blok_api.dto.AdminPostResponseDto;
import com.blog.blok_api.dto.AdminUserResponseDto;
import com.blog.blok_api.exception.ResourceNotFoundException;
import com.blog.blok_api.mapper.AdminPostMapper;
import com.blog.blok_api.mapper.AdminUserMapper;
import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.User;
import com.blog.blok_api.repository.CommentRepository;
import com.blog.blok_api.repository.LikeRepository;
import com.blog.blok_api.repository.PostRepository;
import com.blog.blok_api.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final AdminUserMapper adminUserMapper;
    private final AdminPostMapper adminPostMapper;

    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public AdminServiceImpl(UserRepository userRepository, AdminUserMapper adminUserMapper, PostRepository postRepository, AdminPostMapper adminPostMapper, LikeRepository likeRepository, CommentRepository commentRepository) {
        this.userRepository = userRepository;
        this.adminUserMapper = adminUserMapper;
        this.postRepository = postRepository;
        this.adminPostMapper = adminPostMapper;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserResponseDto> getAllUsers(String q, Pageable pageable) {
        Page<User> page = (q == null || q.isBlank())
                ? userRepository.findAll(pageable)
                : userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q, pageable);

        return page.map(adminUserMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminPostResponseDto> getAllPosts(String q, Pageable pageable) {
        Page<Post> page = (q == null || q.isBlank())
                ? postRepository.findAll(pageable)
                : postRepository.findByTitleContainingIgnoreCaseOrSlugContainingIgnoreCase(q, q, pageable);

        return page.map(adminPostMapper::toDto);
    }

    @Override
    @Transactional
    public void deleteUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + userId));

        // Önce kullanıcının like'larını sil
        likeRepository.deleteAllByUser(user);

        // Kullanıcının postlarına ait like'ları sil
        postRepository.findByAuthor(user).forEach(post -> {
            likeRepository.deleteAllByPost(post);
        });

        // Kullanıcının yorumlarını ve alt cevaplarını sil
        commentRepository.deleteAllByAuthor(user);

        // Kullanıcının postlarını sil (onlara bağlı yorumlar cascade ile silinmeli)
        postRepository.deleteAllByAuthor(user);

        // En son kullanıcıyı sil
        userRepository.delete(user);
    }

}
