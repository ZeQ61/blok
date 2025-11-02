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
     * Top-N en çok beğenilenler (ilişkilerle)
     * LEFT JOIN ile like sayısına göre sıralama
     */
    @EntityGraph(attributePaths = { "author", "author.role", "tags" })
    @Query("""
           SELECT p 
           FROM Post p 
           LEFT JOIN Like l ON p.id = l.post.id
           WHERE p.isPublished = true
           GROUP BY p.id, p.createdAt, p.title, p.slug, p.summary, p.content, 
                    p.coverImageUrl, p.isPublished, p.viewsCount, p.updatedAt
           ORDER BY COUNT(l.id) DESC, p.createdAt DESC
           """)
    List<Post> findTopMostLikedPostsWithRelations(Pageable pageable);

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
}
