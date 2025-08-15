package com.blog.blok_api.service;


import com.blog.blok_api.dto.PostResponseDto;
import com.blog.blok_api.dto.ProfileRequestDto;
import com.blog.blok_api.dto.ProfileResponseDto;
import com.blog.blok_api.exception.ResourceNotFoundException;
import com.blog.blok_api.model.User;
import com.blog.blok_api.repository.LikeRepository;
import com.blog.blok_api.repository.PostRepository;
import com.blog.blok_api.repository.UserRepository;
import com.blog.blok_api.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final PostRepository postRepository;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, LikeRepository likeRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
        this.postRepository = postRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponseDto getProfile(String token) throws Exception {
        if (token == null || token.isEmpty()) {
            throw new Exception("token bulunamadı.");
        }
        Long userId = jwtUtil.extractUserId(token);
        Optional<User> user;
        if (userId != null) {
            user = userRepository.findById(userId);
        } else {
            String username = jwtUtil.extractUsername(token);
            user = userRepository.findByUsername(username);
        }
        if (user.isEmpty()) {
            throw new Exception("Kullanıcı bulunamadı.");
        }

        // Toplam like sayısını hesapla
        int likesReceived = 0;
        int postsCount = 0;
        if (user.get().getPosts() != null) {
            postsCount = user.get().getPosts().size();
            for (var post : user.get().getPosts()) {
                likesReceived += likeRepository.countByPost(post);
            }
        }

        return ProfileResponseDto.builder()
                .id(user.get().getId())
                .username(user.get().getUsername())
                .email(user.get().getEmail())
                .profileImgUrl(user.get().getProfileImgUrl())
                .bio(user.get().getBio())
                .isOnline(user.get().isOnline())
                .createdAt(user.get().getCreatedAt())
                .updatedAt(user.get().getUpdatedAt())
                .postsCount(postsCount)
                .likesReceived(likesReceived)
                .build();
    }


    @Override
    public ProfileResponseDto updateProfile(String token, ProfileRequestDto profileRequestDto) throws Exception {
        if (token == null || token.isEmpty()) {
            throw new Exception("token bulunamadı.");
        }
        Long userId = jwtUtil.extractUserId(token);
        Optional<User> userOpt;
        if (userId != null) {
            userOpt = userRepository.findById(userId);
        } else {
            String username = jwtUtil.extractUsername(token);
            userOpt = userRepository.findByUsername(username);
        }
        if (userOpt.isEmpty()) {
            throw new Exception("Kullanıcı bulunamadı.");
        }
        User user = userOpt.get();

        if(profileRequestDto.getBio() != null && !profileRequestDto.getBio().isEmpty()){
            user.setBio(profileRequestDto.getBio());
        }
        if(profileRequestDto.getUsername() != null && !profileRequestDto.getUsername().isEmpty()){
            user.setUsername(profileRequestDto.getUsername());
        }
        if(profileRequestDto.getProfileImgUrl() != null && !profileRequestDto.getProfileImgUrl().isEmpty()){
            user.setProfileImgUrl(profileRequestDto.getProfileImgUrl());
        }
        if(profileRequestDto.getEmail() != null && !profileRequestDto.getEmail().isEmpty()){
            user.setEmail(profileRequestDto.getEmail());
        }
        if(profileRequestDto.getPassword() != null && !profileRequestDto.getPassword().isEmpty()){
            // Eski şifre kontrolü
            if(profileRequestDto.getCurrentPassword() == null || profileRequestDto.getCurrentPassword().isEmpty()){
                throw new Exception("Eski şifre girilmelidir.");
            }
            if(!passwordEncoder.matches(profileRequestDto.getCurrentPassword(), user.getHashedPassword())){
                throw new Exception("Eski şifre yanlış.");
            }
            user.setHashedPassword(passwordEncoder.encode(profileRequestDto.getPassword()));
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // --- LAZY koleksiyonlara erişmeden repository ile sayım yap ---
        int postsCount = postRepository.countByAuthor(user);
        int likesReceived = likeRepository.countByAuthorPosts(user.getId());

        return ProfileResponseDto.builder()
                .id(user.getId())
                .bio(user.getBio())
                .email(user.getEmail())
                .username(user.getUsername())
                .profileImgUrl(user.getProfileImgUrl())
                .isOnline(user.isOnline())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .postsCount(postsCount)
                .likesReceived(likesReceived)
                .build();
    }



    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional
    public String uploadProfileImage(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kullanıcı bulunamadı: " + userId));

        // Dosya tipi kontrolü
        if (!file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Sadece resim dosyaları yüklenebilir!");
        }

        // Dosya adı benzersiz olsun
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(uploadDir, fileName);
        Files.createDirectories(path.getParent());

        // Dosyayı kaydet
        Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

        // Kullanıcıya image url'yi set et
        String imageUrl = "/uploads/" + fileName;
        user.setProfileImgUrl(imageUrl);
        userRepository.save(user);

        return imageUrl;
    }







}
