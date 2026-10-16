package com.jll.cibus.productcategory.service;

import com.jll.cibus.productcategory.dto.ProductCategoryRequestDTO;
import com.jll.cibus.productcategory.dto.ProductCategoryResponseDTO;

import java.util.List;

public interface ProductCategoryService {
    ProductCategoryResponseDTO create(ProductCategoryRequestDTO dto);
    List<ProductCategoryResponseDTO> findAll();
    ProductCategoryResponseDTO findById(Long id);
    ProductCategoryResponseDTO findByName(String name);
    ProductCategoryResponseDTO update(Long id, ProductCategoryRequestDTO dto);
    void delete(Long id);
}
