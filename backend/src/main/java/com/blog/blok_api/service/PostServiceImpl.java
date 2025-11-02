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
import java.time.LocalDateTime;
import java.util.HashMap;
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
    private final PostViewRepository postViewRepository;
    private final SavedPostRepository savedPostRepository;
    private final Cloudinary cloudinary;

    public PostServiceImpl(PostRepository postRepository,
                           UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           TagRepository tagRepository,
                           JwtUtil jwtUtil,
                           PostMapper postMapper,
                           LikeService likeService, 
                           LikeRepository likeRepository, 
                           CommentRepository commentRepository,
                           PostViewRepository postViewRepository,
                           SavedPostRepository savedPostRepository,
                           Cloudinary cloudinary) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.tagRepository = tagRepository;
        this.jwtUtil = jwtUtil;
        this.postMapper = postMapper;
        this.likeService = likeService;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.postViewRepository = postViewRepository;
        this.savedPostRepository = savedPostRepository;
        this.cloudinary = cloudinary;
    }

    @Override
    public PostResponseDto createPost(String token, PostRequestDto dto) throws Exception {
        Long userId = jwtUtil.extractUserId(token);
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı."));

        // Tag'leri isimlerinden oluştur veya bul (@araba formatından @ işaretini kaldır)
        Set<Tag> tags = Set.of();
        if (dto.getTagNames() != null && !dto.getTagNames().isEmpty()) {
            tags = dto.getTagNames().stream()
                    .map(tagName -> {
                        // @araba -> araba
                        String tempName = tagName.startsWith("@") ? tagName.substring(1) : tagName;
                        final String cleanName = tempName.trim().toLowerCase();
                        if (cleanName.isEmpty()) return null;

                        // Tag var mı kontrol et
                        return tagRepository.findByNameIgnoreCase(cleanName)
                                .orElseGet(() -> {
                                    // Yoksa yeni tag oluştur
                                    Tag newTag = new Tag();
                                    newTag.setName(cleanName);
                                    newTag.setSlug(SlugUtil.toSlug(cleanName));
                                    return tagRepository.save(newTag);
                                });
                    })
                    .filter(tag -> tag != null)
                    .collect(Collectors.toSet());
        }

        Post post = postMapper.toEntity(dto);
        post.setCategory(null); // Kategori artık kullanılmıyor
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
    @Transactional(readOnly = true)
    public PostResponseDto getPostById(Long id, String token) throws Exception {
        // EntityGraph ile tags'ı eager olarak yükle - LazyInitializationException önleme
        Post post = postRepository.findByIdWithRelations(id)
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

    /**
     * Tüm yayınlanmış postları getir - OPTİMİZE EDİLMİŞ
     * N+1 problemi çözüldü: Tek sorguda ilişkiler, batch count sorguları
     */
    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDto> getAllPosts(String token) {
        // 1. Post'ları ilişkilerle birlikte tek sorguda çek
        List<Post> posts = postRepository.findAllPublishedPostsWithRelations();
        if (posts.isEmpty()) {
            return List.of();
        }

        // 2. Post ID'lerini çıkar
        List<Long> postIds = posts.stream().map(Post::getId).collect(Collectors.toList());

        // 3. Current user bilgisini al
        Long currentUserId = null;
        if (token != null && !token.isBlank()) {
            try {
                currentUserId = jwtUtil.extractUserId(token);
            } catch (Exception ignored) {
                // Token geçersizse devam et
            }
        }

        // 4. Batch sorgular: Like count, Comment count, Liked post IDs
        Map<Long, Integer> likeCountMap = getLikeCountsByPostIds(postIds);
        Map<Long, Integer> commentCountMap = getCommentCountsByPostIds(postIds);
        Set<Long> likedPostIds = currentUserId != null 
            ? getLikedPostIdsByUserIdAndPostIds(currentUserId, postIds)
            : Set.of();

        // 5. DTO'ları oluştur (map'lerden değerleri al)
        return posts.stream()
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeCountMap.getOrDefault(post.getId(), 0));
                    dto.setCommentCount(commentCountMap.getOrDefault(post.getId(), 0));
                    dto.setLikedByCurrentUser(likedPostIds.contains(post.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Kullanıcının postlarını getir - OPTİMİZE EDİLMİŞ
     * N+1 problemi çözüldü: Batch sorgular kullanılıyor
     */
    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDto> getMyPosts(String token) {
        Long userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı"));

        // 1. Post'ları ilişkilerle birlikte tek sorguda çek
        List<Post> posts = postRepository.findAllByAuthorWithRelations(user);
        if (posts.isEmpty()) {
            return List.of();
        }

        // 2. Post ID'lerini çıkar
        List<Long> postIds = posts.stream().map(Post::getId).collect(Collectors.toList());

        // 3. Batch sorgular: Like count, Comment count, Liked post IDs
        Map<Long, Integer> likeCountMap = getLikeCountsByPostIds(postIds);
        Map<Long, Integer> commentCountMap = getCommentCountsByPostIds(postIds);
        Set<Long> likedPostIds = getLikedPostIdsByUserIdAndPostIds(userId, postIds);

        // 4. DTO'ları oluştur
        return posts.stream()
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeCountMap.getOrDefault(post.getId(), 0));
                    dto.setCommentCount(commentCountMap.getOrDefault(post.getId(), 0));
                    dto.setLikedByCurrentUser(likedPostIds.contains(post.getId()));
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

        // 4. Posta ait görüntülenme kayıtlarını sil (foreign key constraint hatası önleme)
        postViewRepository.deleteAllByPost(post);

        // 5. Posta ait kaydedilmiş post kayıtlarını sil (foreign key constraint hatası önleme)
        savedPostRepository.deleteAllByPost(post);

        // 6. En son post'u sil
        postRepository.delete(post);
    }


    /**
     * Trend konular postları getir - PUANLAMA SİSTEMİ İLE
     * Puanlama: (beğeni * 5) + (yorum * 10) + (kaydetme * 15) + (görüntülenme * 3)
     * N+1 problemi çözüldü: İki adımlı yaklaşım (ID'ler, sonra EntityGraph ile eager loading)
     */
    @Override
    @Transactional(readOnly = true)
    public List<PostResponseDto> getTop5MostLikedPosts(String token) {
        Pageable top5 = PageRequest.of(0, 5);

        // 1. Önce puanlama sistemine göre sıralı Post ID'lerini al
        List<Long> topPostIds = postRepository.findTopTrendingPostIds(top5);
        if (topPostIds.isEmpty()) {
            return List.of();
        }

        // 2. Post ID'lerine göre Post'ları EntityGraph ile eager loading yaparak çek
        List<Post> topPosts = postRepository.findByIdsWithRelations(topPostIds);
        
        // 3. Post ID'lerindeki sıralamayı korumak için Map oluştur
        Map<Long, Post> postMap = topPosts.stream()
                .collect(Collectors.toMap(Post::getId, post -> post, (p1, p2) -> p1, java.util.LinkedHashMap::new));

        // 4. Current user bilgisini al
        Long currentUserId = null;
        if (token != null && !token.isBlank()) {
            try {
                currentUserId = jwtUtil.extractUserId(token);
            } catch (Exception ignored) {
                // Token geçersizse devam et
            }
        }

        // 5. Batch sorgular: Like count, Comment count, Liked post IDs
        // NOT: Puanlama (beğeni*5 + yorum*10 + kaydetme*15 + görüntülenme*3) sorgu içinde yapılıyor
        Map<Long, Integer> likeCountMap = getLikeCountsByPostIds(topPostIds);
        Map<Long, Integer> commentCountMap = getCommentCountsByPostIds(topPostIds);
        Set<Long> likedPostIds = currentUserId != null 
            ? getLikedPostIdsByUserIdAndPostIds(currentUserId, topPostIds)
            : Set.of();

        // 6. Sıralamayı koruyarak DTO'ları oluştur
        return topPostIds.stream()
                .map(postId -> postMap.get(postId))
                .filter(post -> post != null)
                .map(post -> {
                    PostResponseDto dto = postMapper.toDto(post);
                    dto.setLikeCount(likeCountMap.getOrDefault(post.getId(), 0));
                    dto.setCommentCount(commentCountMap.getOrDefault(post.getId(), 0));
                    dto.setLikedByCurrentUser(likedPostIds.contains(post.getId()));
                    // viewsCount'u Post entity'sinden al (MapStruct otomatik map eder ama açıkça set ediyoruz)
                    dto.setViewsCount(post.getViewsCount());
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

    // ========= YARDIMCI BATCH SORGULARI =========

    /**
     * Post ID'leri için like count'ları toplu olarak getir
     * @param postIds Post ID listesi
     * @return Map<PostId, LikeCount>
     */
    private Map<Long, Integer> getLikeCountsByPostIds(List<Long> postIds) {
        if (postIds.isEmpty()) {
            return new HashMap<>();
        }

        List<Object[]> results = postRepository.countLikesByPostIds(postIds);
        Map<Long, Integer> likeCountMap = new HashMap<>();

        for (Object[] result : results) {
            Long postId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            likeCountMap.put(postId, count.intValue());
        }

        return likeCountMap;
    }

    /**
     * Post ID'leri için comment count'ları toplu olarak getir
     * @param postIds Post ID listesi
     * @return Map<PostId, CommentCount>
     */
    private Map<Long, Integer> getCommentCountsByPostIds(List<Long> postIds) {
        if (postIds.isEmpty()) {
            return new HashMap<>();
        }

        List<Object[]> results = postRepository.countActiveCommentsByPostIds(postIds);
        Map<Long, Integer> commentCountMap = new HashMap<>();

        for (Object[] result : results) {
            Long postId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            commentCountMap.put(postId, count.intValue());
        }

        return commentCountMap;
    }

    /**
     * Post ID'leri için kaydetme sayılarını toplu olarak getir
     * @param postIds Post ID listesi
     * @return Map<PostId, SavedCount>
     */
    private Map<Long, Integer> getSavedCountsByPostIds(List<Long> postIds) {
        if (postIds.isEmpty()) {
            return new HashMap<>();
        }

        List<Object[]> results = savedPostRepository.countSavedByPostIds(postIds);
        Map<Long, Integer> savedCountMap = new HashMap<>();

        for (Object[] result : results) {
            Long postId = ((Number) result[0]).longValue();
            Long count = ((Number) result[1]).longValue();
            savedCountMap.put(postId, count.intValue());
        }

        return savedCountMap;
    }

    /**
     * Kullanıcının beğendiği post ID'lerini toplu olarak getir
     * @param userId Kullanıcı ID
     * @param postIds Post ID listesi
     * @return Set<PostId> - Beğenilen post ID'leri
     */
    private Set<Long> getLikedPostIdsByUserIdAndPostIds(Long userId, List<Long> postIds) {
        if (postIds.isEmpty()) {
            return Set.of();
        }

        List<Long> likedPostIds = likeRepository.findLikedPostIdsByUserIdAndPostIds(userId, postIds);
        return Set.copyOf(likedPostIds);
    }

    /**
     * Toplu post görüntülenme takibi - PERFORMANS ODAKLI
     * 
     * İşlem Adımları:
     * 1. Token'dan user ID al
     * 2. Boş liste kontrolü
     * 3. Kullanıcının daha önce görüntülediği post ID'lerini tek sorguda bul
     * 4. Yeni görüntülenmeler için PostView kayıtları oluştur (batch insert)
     * 5. views_count'u toplu olarak artır (native query)
     * 
     * Toplam sorgu sayısı: 3 (user çekme, görüntülenmiş postlar kontrolü, views_count güncelleme)
     * PostView kayıtları: Batch save ile toplu insert
     */
    @Override
    @Transactional
    public void trackMultiplePostViews(String token, List<Long> postIds) throws Exception {
        // 1. Boş liste kontrolü
        if (postIds == null || postIds.isEmpty()) {
            return;
        }

        // 2. Token'dan user ID al
        Long userId = jwtUtil.extractUserId(token);
        if (userId == null) {
            throw new Exception("Kullanıcı bulunamadı.");
        }

        // 3. User'ı bul (sadece ID ile, lazy loading)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("Kullanıcı bulunamadı."));

        // 4. Daha önce görüntülenmemiş post ID'lerini bul (TEK SORGU)
        Set<Long> alreadyViewedPostIds = postViewRepository.findViewedPostIdsByUserIdAndPostIds(userId, postIds);
        
        // 5. Yeni görüntülenmeler için post ID'lerini filtrele
        List<Long> newViewPostIds = postIds.stream()
                .filter(postId -> !alreadyViewedPostIds.contains(postId))
                .distinct()
                .collect(Collectors.toList());

        // 6. Eğer yeni görüntülenme yoksa işlem yapma
        if (newViewPostIds.isEmpty()) {
            return;
        }

        // 7. PostView kayıtları oluştur (batch insert için)
        LocalDateTime now = LocalDateTime.now();
        List<PostView> newPostViews = newViewPostIds.stream()
                .map(postId -> {
                    Post post = new Post();
                    post.setId(postId);
                    
                    PostView postView = new PostView();
                    postView.setUser(user);
                    postView.setPost(post);
                    postView.setViewedAt(now);
                    return postView;
                })
                .collect(Collectors.toList());

        // 8. PostView kayıtlarını toplu olarak kaydet
        postViewRepository.saveAll(newPostViews);

        // 9. views_count'u toplu olarak artır (TEK NATIVE QUERY)
        postRepository.incrementViewsBatch(newViewPostIds);
    }

}
