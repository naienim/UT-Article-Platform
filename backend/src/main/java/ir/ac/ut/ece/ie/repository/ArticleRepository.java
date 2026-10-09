package ir.ac.ut.ece.ie.repository;

import java.util.List;
import ir.ac.ut.ece.ie.model.Article;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<Article, Long> {
    boolean existsByTitleIgnoreCase(String title);
    List<Article> findAllByOrderByPublishTimeDesc();
    @Query("SELECT a FROM Article a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.summary) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Article> searchByTitleOrSummary(@Param("query") String query);
    List<Article> findByAuthorIdOrderByPublishTimeDesc(Long authorId);
}
