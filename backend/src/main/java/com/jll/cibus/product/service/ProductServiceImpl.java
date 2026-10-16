package com.jll.cibus.product.service;

import com.jll.cibus.common.exception.ResourceAlreadyExistsException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.product.repository.ProductRepository;
import com.jll.cibus.product.dto.ProductRequestDTO;
import com.jll.cibus.product.dto.ProductResponseDTO;
import com.jll.cibus.product.entity.ProductEntity;
import com.jll.cibus.product.mapper.ProductMapper;
import com.jll.cibus.product.specification.ProductSpecification;
import com.jll.cibus.productcategory.entity.ProductCategoryEntity;
import com.jll.cibus.productcategory.repository.ProductCategoryRepository;
import com.jll.cibus.productcategory.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService{

    private final ProductRepository productRepository;
    private final ProductCategoryService productCategoryService;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductMapper productMapper;

    @Override
    public Boolean existsById(Long id){
        return productRepository.existsById(id);
    }

    private ProductEntity getEntity (Long id){
        return productRepository.findById(id)
                .orElseThrow( () -> new ResourceNotFoundException("Product", id));
    }

    @Override
    public Page<ProductResponseDTO> findAll(Pageable pageable, String name, Long categoryId, String categoryName){
        Specification<ProductEntity> spec = Specification.allOf(
                ProductSpecification.nameContains(name),
                ProductSpecification.equalsCategoryId(categoryId),
                ProductSpecification.equalsCategoryName(categoryName));
        return productRepository.findAll(spec, pageable)
                .map(productMapper::toDTO);
    }

    @Override
    public ProductResponseDTO findById(Long id){
        ProductEntity product = getEntity(id);
        return productMapper.toDTO(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO create(ProductRequestDTO dto){
        if(productRepository.findByNameIgnoreCase(dto.getName()).isPresent()) throw new ResourceAlreadyExistsException("Product", dto.getName());
        ProductEntity entity = productMapper.toEntity(dto);
        entity.setCategory(productCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(()->new ResourceNotFoundException("category", dto.getCategoryId())));
        ProductEntity saved = productRepository.save(entity);
        return productMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ProductResponseDTO update(Long id, ProductRequestDTO dto){
        ProductEntity product = getEntity(id);
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setCategory(productCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(()->new ResourceNotFoundException("category",dto.getCategoryId())));
        ProductEntity updated = productRepository.save(product);
        return productMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ProductEntity product = getEntity(id);
        productRepository.delete(product);
    }

    @Override
    public List<String> getProductCategories(){
        return productCategoryRepository.findAll().stream()
                .map(ProductCategoryEntity::getName)
                .toList();
    }

}
