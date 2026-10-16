package com.jll.cibus.productcategory.service;

import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.common.exception.ResourceAlreadyExistsException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.productcategory.dto.ProductCategoryRequestDTO;
import com.jll.cibus.productcategory.dto.ProductCategoryResponseDTO;
import com.jll.cibus.productcategory.entity.ProductCategoryEntity;
import com.jll.cibus.productcategory.mapper.ProductCategoryMapper;
import com.jll.cibus.productcategory.repository.ProductCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductCategoryServiceImpl implements ProductCategoryService{

    private final ProductCategoryRepository productCategoryRepository;
    private final ProductCategoryMapper productCategoryMapper;

    public ProductCategoryServiceImpl(ProductCategoryRepository productCategoryRepository, ProductCategoryMapper productCategoryMapper) {
        this.productCategoryRepository = productCategoryRepository;
        this.productCategoryMapper = productCategoryMapper;
    }

    @Override
    @Transactional
    public ProductCategoryResponseDTO create (ProductCategoryRequestDTO dto){
        if(productCategoryRepository.findByNameIgnoreCase(dto.getName()).isPresent()){
            throw new ResourceAlreadyExistsException("Category", dto.getName());
        }
        ProductCategoryEntity entity = productCategoryMapper.toEntity(dto);
        ProductCategoryEntity saved = productCategoryRepository.save(entity);
        return productCategoryMapper.toDTO(saved);
    }

    @Override
    public List<ProductCategoryResponseDTO> findAll (){
        List<ProductCategoryEntity> categories = productCategoryRepository.findAll();

        if(categories.isEmpty()) throw new BusinessException("Can't show category products if there is no categories yet");

        return categories.stream()
                .map(productCategoryMapper::toDTO)
                .toList();
    }

    @Override
    public ProductCategoryResponseDTO findById(Long id){
        ProductCategoryEntity category = productCategoryRepository.findById(id)
                .orElseThrow( () -> new ResourceNotFoundException("Category", id));

        return productCategoryMapper.toDTO(category);
    }

    @Override
    public ProductCategoryResponseDTO findByName(String name){
        ProductCategoryEntity category = productCategoryRepository.findByNameIgnoreCase(name)
                .orElseThrow( () -> new ResourceNotFoundException("Name", name));

        return productCategoryMapper.toDTO(category);
    }

    @Override
    @Transactional
    public ProductCategoryResponseDTO update(Long id, ProductCategoryRequestDTO dto){
        ProductCategoryEntity category = productCategoryRepository.findById(id)
                .orElseThrow( () -> new ResourceNotFoundException("Category", id));

        Optional<ProductCategoryEntity> existing = productCategoryRepository.findByNameIgnoreCase(dto.getName());
        if(existing.isPresent() && !existing.get().getId().equals(id)){
            throw new ResourceAlreadyExistsException("Category", dto.getName());
        }

        category.setName(dto.getName());
        ProductCategoryEntity saved = productCategoryRepository.save(category);

        return productCategoryMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void delete(Long id){
        ProductCategoryEntity category = productCategoryRepository.findById(id)
                .orElseThrow( () -> new ResourceNotFoundException("Category", id));
        productCategoryRepository.delete(category);
    }

    private ProductCategoryEntity getEntity(Long id){
        return productCategoryRepository.findById(id)
                .orElseThrow( () -> new ResourceNotFoundException("Category", id));
    }

}
