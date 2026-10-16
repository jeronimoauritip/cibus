package com.jll.cibus.product.service;

import com.jll.cibus.product.dto.ProductRequestDTO;
import com.jll.cibus.product.dto.ProductResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {
    Boolean existsById(Long id);
    Page<ProductResponseDTO> findAll(Pageable pageable, String name, Long categoryId, String categoryName);
    ProductResponseDTO findById(Long id);
    ProductResponseDTO create(ProductRequestDTO dto);
    ProductResponseDTO update(Long id, ProductRequestDTO dto);
    void delete(Long id);
    List<String> getProductCategories();
}