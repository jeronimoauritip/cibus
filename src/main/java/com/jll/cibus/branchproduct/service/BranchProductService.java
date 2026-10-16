package com.jll.cibus.branchproduct.service;

import com.jll.cibus.branchproduct.dto.BranchProductRequestDTO;
import com.jll.cibus.branchproduct.dto.BranchProductResponseDTO;
import com.jll.cibus.branchproduct.dto.BranchProductUpdateDTO;
import com.jll.cibus.branchproduct.entity.BranchProductEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface BranchProductService {
    Page<BranchProductResponseDTO> findAll(Pageable pageable, Long branchId, Long productId, String productName, Long categoryId, Boolean available, BigDecimal minPrice, BigDecimal maxPrice);
    BranchProductEntity getEntityByBranchAndProduct(Long branchId, Long productId);
    BranchProductResponseDTO getByBranchAndProduct(Long branchId, Long productId);
    BranchProductResponseDTO create(Long branchId, BranchProductRequestDTO dto);
    BranchProductResponseDTO update(Long branchId, Long productId, BranchProductUpdateDTO dto);
    void enable(Long id);
    void disable(Long id);
    void delete(Long branchId, Long productId);
}