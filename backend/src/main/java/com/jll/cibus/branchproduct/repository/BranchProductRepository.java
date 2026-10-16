package com.jll.cibus.branchproduct.repository;

import com.jll.cibus.branchproduct.entity.BranchProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchProductRepository extends JpaRepository<BranchProductEntity, Long>, JpaSpecificationExecutor<BranchProductEntity> {

    List<BranchProductEntity> findAllByBranch_Name(String name);

    List<BranchProductEntity> findAllByBranch_Id(Long branchId);

    List<BranchProductEntity> findAllByBranch_IdAndAvailableTrue(Long branchId);

    List<BranchProductEntity> findAllByBranch_NameAndAvailableTrue(String branchName);

    Optional<BranchProductEntity> findByBranch_IdAndProduct_Id(Long branchId, Long productId);

    boolean existsByBranch_IdAndProduct_Id(Long branchId, Long productId);

}
