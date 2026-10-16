package com.jll.cibus.branchproduct.service;

import com.jll.cibus.auth.AuthService;
import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.branchproduct.dto.BranchProductRequestDTO;
import com.jll.cibus.branchproduct.dto.BranchProductResponseDTO;
import com.jll.cibus.branchproduct.dto.BranchProductUpdateDTO;
import com.jll.cibus.branchproduct.entity.BranchProductEntity;
import com.jll.cibus.branchproduct.mapper.BranchProductMapper;
import com.jll.cibus.branchproduct.repository.BranchProductRepository;
import com.jll.cibus.branchproduct.specification.BranchProductSpecification;
import com.jll.cibus.common.exception.ResourceAlreadyExistsException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.product.entity.ProductEntity;
import com.jll.cibus.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
@Transactional
@RequiredArgsConstructor
public class BranchProductServiceImpl implements BranchProductService{

    private final BranchProductRepository branchProductRepository;
    private final BranchProductMapper branchProductMapper;
    private final BranchRepository branchRepository;
    private final ProductRepository productRepository;
    private final AuthService authService;


    private void authenticateUserBelongsInBranch(Long branchId){
        if(!branchRepository.existsById(branchId)){
            throw new ResourceNotFoundException("branch ID", branchId);
        }
        authService.authenticateUserBelongsInBranch(branchId);
    }

    @Override
    public Page<BranchProductResponseDTO> findAll(Pageable pageable, Long branchId, Long productId, String productName, Long categoryId, Boolean available, BigDecimal minPrice, BigDecimal maxPrice){
        authenticateUserBelongsInBranch(branchId);
        Specification<BranchProductEntity> spec = Specification.allOf(
                BranchProductSpecification.equalsBranchId(branchId),
                BranchProductSpecification.equalsProductId(productId),
                BranchProductSpecification.containsProductName(productName),
                BranchProductSpecification.equalsCategoryId(categoryId),
                BranchProductSpecification.isAvailable(available),
                BranchProductSpecification.priceGreaterThanOrEqualTo(minPrice),
                BranchProductSpecification.priceLessThanOrEqualTo(maxPrice)
        );

        return branchProductRepository.findAll(spec, pageable)
                .map(branchProductMapper::toDTO);
    }

    private BranchProductEntity getEntity(Long id){
        return branchProductRepository.findById(id).
                orElseThrow(() -> new ResourceNotFoundException("Menu Item", id));
    }

    @Override
    public BranchProductEntity getEntityByBranchAndProduct(Long branchId, Long productId){
        branchRepository.findById(branchId)
                .orElseThrow(()-> new ResourceNotFoundException("branch", branchId));
        productRepository.findById(productId)
                        .orElseThrow(()-> new ResourceNotFoundException("product",productId));
        return branchProductRepository.findByBranch_IdAndProduct_Id(branchId, productId).
                orElseThrow(() -> new ResourceNotFoundException("Menu Item", productId));
    }

    @Override
    public BranchProductResponseDTO getByBranchAndProduct(Long branchId, Long productId){
        authenticateUserBelongsInBranch(branchId);
        BranchProductEntity product = getEntityByBranchAndProduct(branchId, productId);
        return branchProductMapper.toDTO(product);
    }

    @Override
    public BranchProductResponseDTO create (Long branchId, BranchProductRequestDTO dto){
        authenticateUserBelongsInBranch(branchId);
        BranchEntity branch = branchRepository.findById(branchId)
                .orElseThrow(()-> new ResourceNotFoundException("branch", branchId));
        ProductEntity product =productRepository.findById(dto.getProductId())
                        .orElseThrow(()-> new ResourceNotFoundException("product", dto.getProductId()));
        if(branchProductRepository.existsByBranch_IdAndProduct_Id(branchId, dto.getProductId())){
            throw new ResourceAlreadyExistsException("The product with ID "+dto.getProductId()+" already exists in  branch with id "+branchId);
        }
        BranchProductEntity entity = branchProductMapper.toEntity(dto);
        entity.setBranch(branch);
        entity.setProduct(product);
        entity.setAvailable(Boolean.TRUE);
        BranchProductEntity saved = branchProductRepository.save(entity);
        return branchProductMapper.toDTO(saved);
    }

    @Override
    public BranchProductResponseDTO update(Long branchId, Long productId, BranchProductUpdateDTO dto){
        authenticateUserBelongsInBranch(branchId);
        BranchProductEntity entity = getEntityByBranchAndProduct(branchId, productId);
        if(dto.getPrice() != null){
            entity.setPrice(dto.getPrice());
        }
        if(dto.getAvailable() != null){
            entity.setAvailable(dto.getAvailable());
        }
        BranchProductEntity saved = branchProductRepository.save(entity);
        return branchProductMapper.toDTO(saved);
    }

    private void changeAvailability(Long id, Boolean available){
        BranchProductEntity entity = getEntity(id);
        entity.setAvailable(available);
        branchProductRepository.save(entity);
    }

    @Override
    public void enable(Long id){
        changeAvailability(id, Boolean.TRUE);
    }

    @Override
    public void disable(Long id){
        changeAvailability(id, Boolean.FALSE);
    }

    @Override
    public void delete(Long branchId, Long productId){
        authenticateUserBelongsInBranch(branchId);
        BranchProductEntity entity = getEntityByBranchAndProduct(branchId, productId);
        branchProductRepository.delete(entity);
    }

}