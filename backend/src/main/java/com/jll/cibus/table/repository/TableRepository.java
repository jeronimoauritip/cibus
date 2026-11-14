package com.jll.cibus.table.repository;

import com.jll.cibus.table.entity.TableEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TableRepository extends JpaRepository<TableEntity, Long> {


    @Query("""
    SELECT t
    FROM TableEntity t
    WHERE t.branch.id = :branchId
    AND t.active = true
    """)
    List<TableEntity> findByBranchId(@Param("branchId") Long branchId);

    Optional<TableEntity> findByBranch_IdAndNumber(Long branchId, Integer number);

    Optional<TableEntity> findByBranch_IdAndNumberAndActiveTrue(Long branchId, Integer number);

    @Query("""
    SELECT t
    FROM TableEntity t
    WHERE t.waiter.id = :waiterId
    AND t.active = true
    """)
    List<TableEntity> findByWaiter_id(@Param("waiterId") Long waiterId);

    @Query("""
    SELECT COUNT(t)
    FROM TableEntity t
    WHERE t.branch.id = :branchId
    AND t.active = true
    """)
    Long countByBranchId(@Param("branchId") Long branchId);

    @Query("""
    SELECT COUNT(t)
    FROM TableEntity t
    WHERE t.active = true
    """)
    long countActiveTables();

    boolean existsById(Long id);

    @Query("""
    SELECT COUNT(t) > 0
    FROM TableEntity t
    WHERE t.id = :tableId
    AND t.branch.id = :branchId
    AND t.active = true
    """)
    Boolean existsByIdAndBranchId(@Param("tableId") Long tableId, @Param("branchId") Long branchId);

    @Query("""
    SELECT COUNT(t) > 0
    FROM TableEntity t
    WHERE t.branch.id = :branchId
    AND t.number = :number
    AND t.active = true
    """)
    boolean existsByBranchIdAndNumber(@Param("branchId") Long branchId, @Param("number") Integer number);

    Page<TableEntity> findAll(Specification<TableEntity> spec, Pageable pageable);

    @Query("""
    SELECT COUNT(t) > 0
    FROM TableEntity t
    WHERE t.branch.id = :branchId
    AND t.active = true
    """)
    Boolean hasActiveTables(@Param("branchId") Long branchId);
}
