package com.jll.cibus.order.repository;

import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.statistics.dto.order.OrderMetricDTO;
import com.jll.cibus.statistics.dto.table.TableMetricDTO;
import com.jll.cibus.statistics.dto.waiter.WaiterMetricDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long>, JpaSpecificationExecutor<OrderEntity> {

    @Query("""
    SELECT COUNT(o) > 0
        FROM OrderEntity o
        WHERE o.waiter.id = :userId
        AND (
            o.status.name = 'PENDING'
            OR o.status.name = 'PREPARING'
            OR o.status.name = 'READY'
            OR o.status.name = 'SERVED'
        )
   """)
    Boolean userHasOrdersActive(@Param("userId") Long userId);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.table.TableMetricDTO(t.number, COUNT(o))
        FROM OrderEntity o
        JOIN o.table t
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY t.id, t.number
        ORDER BY COUNT(o) DESC
    """)
    List<TableMetricDTO> findMostBusyTable(@Param("branchId") Long branchId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.table.TableMetricDTO(t.number, COUNT(o))
        FROM OrderEntity o
        JOIN o.table t
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY t.id, t.number
        ORDER BY COUNT(o) ASC
    """)
    List<TableMetricDTO> findLessBusyTable(@Param("branchId") Long branchId,
                                           @Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    @Query("""
    SELECT COUNT(DISTINCT o.table.id)
        FROM OrderEntity o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
    """)
    Long countOccupiedTables(@Param("branchId") Long branchId,
                             @Param("start") LocalDateTime start,
                             @Param("end") LocalDateTime end);

    @Query("""
    SELECT COUNT(DISTINCT o.table.id)
        FROM OrderEntity o
        WHERE o.createdAt BETWEEN :start AND :end
    """)
    Long countGlobalOccupiedTables(@Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);


    @Query("""
    SELECT SUM (o.finalTotal)
        FROM OrderEntity o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
    """)
    BigDecimal getTotalRevenue(@Param("branchId") Long branchId,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);

    @Query("""
    SELECT COUNT(o)
        FROM OrderEntity o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
    """)
    Long getTotalOrdersBetweenTime(@Param("branchId") Long branchId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.order.OrderMetricDTO(o.id, o.branch.id, o.table.id, CONCAT(o.waiter.lastName, ", ", o.waiter.firstName), o.finalTotal, o.closedAt)
        FROM OrderEntity o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        ORDER BY o.finalTotal DESC
    """)
    List<OrderMetricDTO> getMostValuatedOrders(@Param("branchId") Long branchId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.order.OrderMetricDTO(o.id, o.branch.id, o.table.id, CONCAT(o.waiter.lastName, ", ", o.waiter.firstName), o.finalTotal, o.closedAt)
        FROM OrderEntity o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        ORDER BY o.finalTotal ASC
    """)
    List<OrderMetricDTO> getLeastValuatedOrders(@Param("branchId") Long branchId,
                                                @Param("start") LocalDateTime start,
                                                @Param("end") LocalDateTime end);

    @Query("""
    SELECT SUM (o.finalTotal)
        FROM OrderEntity o
        WHERE o.createdAt BETWEEN :start AND :end
    """)
    BigDecimal getGlobalTotalRevenue(@Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);


    @Query("""
    SELECT COUNT(o)
        FROM OrderEntity o
        WHERE o.createdAt BETWEEN :start AND :end
    """)
    Long getGlobalTotalOrdersBetweenTime(@Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end);


    @Query("""
    SELECT new com.jll.cibus.statistics.dto.order.OrderMetricDTO(o.id, o.branch.id, o.table.id, CONCAT(o.waiter.lastName, ", ", o.waiter.firstName), o.finalTotal, o.closedAt)
        FROM OrderEntity o
        WHERE o.createdAt BETWEEN :start AND :end
        ORDER BY o.finalTotal DESC
    """)
    List<OrderMetricDTO> getGlobalMostValuatedOrders(@Param("start") LocalDateTime start,
                                                     @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.order.OrderMetricDTO(o.id, o.branch.id, o.table.id, CONCAT(o.waiter.lastName, ", ", o.waiter.firstName), o.finalTotal, o.closedAt)
        FROM OrderEntity o
        WHERE o.createdAt BETWEEN :start AND :end
        ORDER BY o.finalTotal ASC
    """)
    List<OrderMetricDTO> getGlobalLeastValuatedOrders(@Param("start") LocalDateTime start,
                                                      @Param("end") LocalDateTime end);


    @Query("""
    SELECT new com.jll.cibus.statistics.dto.waiter.WaiterMetricDTO(o.waiter.dni, o.waiter.firstName, o.waiter.lastName, o.branch.name, SUM(o.finalTotal), COUNT(o))
        FROM OrderEntity o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY o.waiter.dni, o.waiter.firstName, o.waiter.lastName, o.branch.name
        ORDER BY SUM(o.finalTotal) DESC
    """)
    List<WaiterMetricDTO> getWaiterFacturationRanking(@Param("branchId") Long branchId,
                                                      @Param("start") LocalDateTime start,
                                                      @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.waiter.WaiterMetricDTO(o.waiter.dni, o.waiter.firstName, o.waiter.lastName, o.branch.name, SUM(o.finalTotal), COUNT(o))
        FROM OrderEntity o
        WHERE o.branch.id = :branchId
        AND o.createdAt BETWEEN :start AND :end
        GROUP BY o.waiter.dni, o.waiter.firstName, o.waiter.lastName, o.branch.name
        ORDER BY COUNT(o) DESC
    """)
    List<WaiterMetricDTO> getOrdersQuantityRanking(@Param("branchId") Long branchId,
                                                      @Param("start") LocalDateTime start,
                                                      @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.waiter.WaiterMetricDTO(o.waiter.dni, o.waiter.firstName, o.waiter.lastName, o.branch.name, SUM(o.finalTotal), COUNT(o))
        FROM OrderEntity o
        WHERE o.createdAt BETWEEN :start AND :end
        GROUP BY o.waiter.dni, o.waiter.firstName, o.waiter.lastName, o.branch.name
        ORDER BY SUM(o.finalTotal) DESC
    """)
    List<WaiterMetricDTO> getGlobalWaiterFacturationRanking(@Param("start") LocalDateTime start,
                                                            @Param("end") LocalDateTime end);

    @Query("""
    SELECT new com.jll.cibus.statistics.dto.waiter.WaiterMetricDTO(o.waiter.dni, o.waiter.firstName, o.waiter.lastName, o.branch.name, SUM(o.finalTotal), COUNT(o))
        FROM OrderEntity o
        WHERE o.createdAt BETWEEN :start AND :end
        GROUP BY o.waiter.dni, o.waiter.firstName, o.waiter.lastName, o.branch.name
        ORDER BY COUNT(o) DESC
    """)
    List<WaiterMetricDTO> getGlobalOrdersQuantityRanking(@Param("start") LocalDateTime start,
                                                         @Param("end") LocalDateTime end);

}
