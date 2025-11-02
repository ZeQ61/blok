package com.blog.blok_api.repository;

import com.blog.blok_api.model.Post;
import com.blog.blok_api.model.PostView;
import com.blog.blok_api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

/**
 * PostViewRepository - Post görüntülenme kayıtları için repository
 * Performans odaklı batch sorgular ile optimize edilmiş
 */
@Repository
public interface PostViewRepository extends JpaRepository<PostView, Long> {

    /**
     * Kullanıcının belirli bir postu daha önce görüntüleyip görüntülemediğini kontrol et
     */
    boolean existsByUserAndPost(User user, Post post);

    /**
     * Kullanıcı ID ve Post ID ile kontrol (nesne yüklemeden, performanslı)
     */
    @Query("SELECT COUNT(pv) > 0 FROM PostView pv WHERE pv.user.id = :userId AND pv.post.id = :postId")
    boolean existsByUserIdAndPostId(@Param("userId") Long userId, @Param("postId") Long postId);

    /**
     * Kullanıcının belirli post ID'leri için hangilerini daha önce görüntülediğini toplu olarak getir
     * Sonuç: Sadece post ID'leri (Set<Long>)
     * PERFORMANS: Tek sorgu ile tüm kontrol
     */
    @Query("""
           SELECT pv.post.id
           FROM PostView pv
           WHERE pv.user.id = :userId AND pv.post.id IN :postIds
           """)
    Set<Long> findViewedPostIdsByUserIdAndPostIds(@Param("userId") Long userId, @Param("postIds") List<Long> postIds);

    /**
     * Belirli bir kullanıcı için tüm görüntülenen post ID'lerini getir
     */
    @Query("SELECT pv.post.id FROM PostView pv WHERE pv.user.id = :userId")
    List<Long> findAllPostIdsByUserId(@Param("userId") Long userId);

    /**
     * PostView kayıtlarını toplu olarak sil (kullanıcı silindiğinde)
     */
    void deleteAllByUser(User user);

    /**
     * PostView kayıtlarını toplu olarak sil (post silindiğinde)
     */
    void deleteAllByPost(Post post);
}

