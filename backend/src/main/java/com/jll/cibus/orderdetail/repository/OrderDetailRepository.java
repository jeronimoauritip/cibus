package com.jll.cibus.orderdetail.repository;

import com.jll.cibus.orderdetail.entity.OrderDetailEntity;
import com.jll.cibus.statistics.dto.product.ProductCategoryMetricDTO;
import com.jll.cibus.statistics.dto.product.ProductMetricDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderDetailRepository extends JpaRepository<OrderDetailEntity, Long> {

    List<OrderDetailEntity> findByOrderId(Long orderId);

    Optional<OrderDetailEntity> findByOrderIdAndProductId(Long orderId, Long productId);

    // QUERY's DE ESTADISTICAS DE SUCURSAL
    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductMetricDTO(od.product.id, od.product.name, od.unitPrice, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.id, od.product.name, od.unitPrice
        ORDER BY SUM(od.quantity) DESC
    """)
    List<ProductMetricDTO> findMostPopularProducts(@Param("branchId") Long branchId,
                                                   @Param("start") LocalDateTime start,
                                                   @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductMetricDTO(od.product.id, od.product.name, od.unitPrice, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.id, od.product.name, od.unitPrice
        ORDER BY SUM(od.quantity) ASC
    """)
    List<ProductMetricDTO> findLessPopularProducts(@Param("branchId") Long branchId,
                                                   @Param("start") LocalDateTime start,
                                                   @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductMetricDTO(od.product.id, od.product.name, od.unitPrice, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.id, od.product.name, od.unitPrice
        ORDER BY od.unitPrice DESC
    """)
    List<ProductMetricDTO> findMostExpensiveProducts(@Param("branchId") Long branchId,
                                                     @Param("start") LocalDateTime start,
                                                     @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductMetricDTO(od.product.id, od.product.name, od.unitPrice, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.id, od.product.name, od.unitPrice
        ORDER BY od.unitPrice ASC
    """)
    List<ProductMetricDTO> findCheapestProducts(@Param("branchId") Long branchId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductCategoryMetricDTO(od.product.category.name, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.category.name
        ORDER BY SUM(od.quantity) DESC
    """)
    List<ProductCategoryMetricDTO> findMostPopularCategories(@Param("branchId") Long branchId,
                                                             @Param("start") LocalDateTime start,
                                                             @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductCategoryMetricDTO(od.product.category.name, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.category.name
        ORDER BY SUM(od.quantity) ASC
    """)
    List<ProductCategoryMetricDTO> findLessPopularCategories(@Param("branchId") Long branchId,
                                                             @Param("start") LocalDateTime start,
                                                             @Param("end") LocalDateTime end);


    // QUERY's DE ESTADISTICAS GLOBALES
    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductMetricDTO(od.product.id, od.product.name, od.unitPrice, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.id, od.product.name, od.unitPrice
        ORDER BY SUM(od.quantity) DESC
    """)
    List<ProductMetricDTO> findGlobalMostPopularProducts(@Param("start") LocalDateTime start,
                                                         @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductMetricDTO(od.product.id, od.product.name, od.unitPrice, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.id, od.product.name, od.unitPrice
        ORDER BY SUM(od.quantity) ASC
    """)
    List<ProductMetricDTO> findGlobalLessPopularProducts(@Param("start") LocalDateTime start,
                                                         @Param("end") LocalDateTime end);


    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductMetricDTO(od.product.id, od.product.name, od.unitPrice, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.id, od.product.name, od.unitPrice
        ORDER BY od.unitPrice DESC
    """)
    List<ProductMetricDTO> findGlobalMostExpensiveProducts(@Param("start") LocalDateTime start,
                                                           @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductMetricDTO(od.product.id, od.product.name, od.unitPrice, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.id, od.product.name, od.unitPrice
        ORDER BY od.unitPrice ASC
    """)
    List<ProductMetricDTO> findGlobalCheapestProducts(@Param("start") LocalDateTime start,
                                                      @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductCategoryMetricDTO(od.product.category.name, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.category.name
        ORDER BY SUM(od.quantity) DESC
    """)
    List<ProductCategoryMetricDTO> findGlobalMostPopularCategories(@Param("start") LocalDateTime start,
                                                                   @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.product.ProductCategoryMetricDTO(od.product.category.name, SUM(od.quantity))
        FROM OrderDetailEntity od
        JOIN od.order o
        WHERE o.createdAt BETWEEN :start AND :end
        GROUP BY od.product.category.name
        ORDER BY SUM(od.quantity) ASC
    """)
    List<ProductCategoryMetricDTO> findGlobalLessPopularCategories(@Param("start") LocalDateTime start,
                                                                   @Param("end") LocalDateTime end);
}
