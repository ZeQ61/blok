package com.blog.blok_api.repository;

import com.blog.blok_api.model.Comment;
import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * CommentRepository - Optimize edilmiş batch sorgular
 * Tüm comment işlemleri için repository
 */
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    /**
     * Belirli bir post için silinmemiş yorumları getir
     */
    List<Comment> findByPostAndIsDeletedFalse(Post post);
    
    /**
     * Belirli bir kullanıcının silinmemiş yorumlarını getir
     */
    List<Comment> findByAuthorAndIsDeletedFalse(User author);
    
    /**
     * Post ID'ye göre tüm yorumları getir (silinenler dahil)
     */
    List<Comment> findAllByPostId(Long postId);
    
    /**
     * Belirli ID ve author ID'ye göre yorum bul
     */
    Optional<Comment> findByIdAndAuthorId(Long commentId, Long authorId);

    /**
     * Kullanıcının yorum yaptığı postları getir (distinct)
     */
    @Query("SELECT DISTINCT c.post FROM Comment c WHERE c.author.id = :userId")
    List<Post> findDistinctPostsByAuthorId(@Param("userId") Long userId);

    /**
     * Kullanıcının tüm yorumlarını sil
     */
    void deleteAllByAuthor(User user);

    /**
     * Belirli post ID'leri için aktif yorum sayısını toplu olarak getir
     * Sonuç: [postId, count] şeklinde Object[] array'leri
     * PERFORMANS OPTİMİZASYONU: Batch sorgu ile N+1 problemi çözüldü
     */
    @Query("""
           SELECT c.post.id, COUNT(c.id)
           FROM Comment c
           WHERE c.isDeleted = false AND c.post.id IN :postIds
           GROUP BY c.post.id
           """)
    List<Object[]> countActiveCommentsByPostIds(@Param("postIds") List<Long> postIds);
}

