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


    List<TableEntity> findByBranchId(Long branchId);

    Optional<TableEntity> findByBranch_IdAndNumber(Long branchId, Integer number);

    List<TableEntity> findByWaiter_id(Long waiterId);

    Long countByBranchId(Long branchId);

    boolean existsById(Long id);

    Boolean existsByIdAndBranchId(Long tableId, Long branchId);

    boolean existsByBranchIdAndNumber(Long branchId, Integer number);

    Page<TableEntity> findAll(Specification<TableEntity> spec, Pageable pageable);

    @Query("""
    SELECT COUNT(t) > 0
    FROM TableEntity t
    WHERE t.branch.id = :branchId
    """)
    Boolean hasActiveTables(@Param("branchId") Long branchId);
}
