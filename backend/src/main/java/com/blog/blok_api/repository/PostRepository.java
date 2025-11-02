package com.blog.blok_api.repository;

import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * PostRepository - Optimize edilmiş sorgular ile N+1 problemi çözüldü
 * 
 * EntityGraph kullanarak ilişkiler tek sorguda yüklenir
 * Batch count sorguları ile like ve comment sayıları toplu olarak alınır
 */
@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    int countByAuthor(User author);
    
    List<Post> findByAuthor(User user);
    
    List<Post> findAllByAuthor(User user);
    
    boolean existsBySlug(String slug);

    Page<Post> findByTitleContainingIgnoreCaseOrSlugContainingIgnoreCase(
            String title, String slug, Pageable pageable
    );

    void deleteAllByAuthor(User user);

    // ========= OPTİMİZE EDİLMİŞ ÇAĞRILAR =========

    /**
     * Feed için tek sorguda tüm ilişkileri çek (author, tags)
     * Category artık kullanılmıyor, EntityGraph'ten çıkarıldı
     */
    @EntityGraph(attributePaths = { "author", "author.role", "tags" })
    @Query("""
           SELECT p
           FROM Post p
           WHERE p.isPublished = true
           ORDER BY p.createdAt DESC
           """)
    List<Post> findAllPublishedPostsWithRelations();

    /**
     * Kullanıcının postları (ilişkilerle) – My Posts ekranı
     */
    @EntityGraph(attributePaths = { "author", "author.role", "tags" })
    @Query("""
           SELECT p
           FROM Post p
           WHERE p.author = :author
           ORDER BY p.createdAt DESC
           """)
    List<Post> findAllByAuthorWithRelations(@Param("author") User author);

    /**
     * Post ID ile tek post getir (ilişkilerle) - LazyInitializationException önleme
     * author, author.role ve tags eager olarak yüklenir
     */
    @EntityGraph(attributePaths = { "author", "author.role", "tags" })
    @Query("""
           SELECT p
           FROM Post p
           WHERE p.id = :id
           """)
    Optional<Post> findByIdWithRelations(@Param("id") Long id);

    /**
     * Post ID listesi ile postları getir (ilişkilerle) - LazyInitializationException önleme
     * ID listesindeki sıralama korunur
     * author, author.role ve tags eager olarak yüklenir
     */
    @EntityGraph(attributePaths = { "author", "author.role", "tags" })
    @Query("""
           SELECT p
           FROM Post p
           WHERE p.id IN :ids
           """)
    List<Post> findByIdsWithRelations(@Param("ids") List<Long> ids);

    /**
     * Top-N trend post ID'lerini getir - PUANLAMA SİSTEMİ
     * Puanlama: (beğeni * 5) + (yorum * 10) + (kaydetme * 15) + (görüntülenme * 3)
     * Bu metod sadece Post ID'lerini döndürür, Post entity'leri için findByIdsWithRelations kullanılmalı
     */
    @Query("""
           SELECT p.id
           FROM Post p 
           LEFT JOIN Like l ON p.id = l.post.id
           LEFT JOIN Comment c ON p.id = c.post.id AND c.isDeleted = false
           LEFT JOIN SavedPost sp ON p.id = sp.post.id
           WHERE p.isPublished = true
           GROUP BY p.id, p.createdAt, p.viewsCount
           ORDER BY 
               (COUNT(DISTINCT l.id) * 5 + 
                COUNT(DISTINCT c.id) * 10 + 
                COUNT(DISTINCT sp.id) * 15 + 
                p.viewsCount * 3) DESC, 
               p.createdAt DESC
           """)
    List<Long> findTopTrendingPostIds(Pageable pageable);

    /**
     * Belirli post ID'leri için like count (tek sorgu, group-by)
     * Sonuç: [postId, count] şeklinde Object[] array'leri
     */
    @Query("""
           SELECT l.post.id, COUNT(l.id)
           FROM Like l
           WHERE l.post.id IN :postIds
           GROUP BY l.post.id
           """)
    List<Object[]> countLikesByPostIds(@Param("postIds") List<Long> postIds);

    /**
     * Belirli post ID'leri için aktif yorum count (tek sorgu, group-by)
     * Sonuç: [postId, count] şeklinde Object[] array'leri
     */
    @Query("""
           SELECT c.post.id, COUNT(c.id)
           FROM Comment c
           WHERE c.isDeleted = false AND c.post.id IN :postIds
           GROUP BY c.post.id
           """)
    List<Object[]> countActiveCommentsByPostIds(@Param("postIds") List<Long> postIds);

    /**
     * Belirli post ID'leri için views_count'u toplu olarak artır
     * PERFORMANS: Native query ile tek sorguda güncelleme
     * Sadece listedeki ID'ler için views_count += 1 yapar
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(
        value = "UPDATE posts SET views_count = views_count + 1 WHERE id IN :postIds",
        nativeQuery = true
    )
    @org.springframework.transaction.annotation.Transactional
    int incrementViewsBatch(@Param("postIds") List<Long> postIds);
}
