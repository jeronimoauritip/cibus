package com.jll.cibus.productcategory.mapper;

import com.jll.cibus.common.model.IMapper;
import com.jll.cibus.productcategory.dto.ProductCategoryRequestDTO;
import com.jll.cibus.productcategory.dto.ProductCategoryResponseDTO;
import com.jll.cibus.productcategory.entity.ProductCategoryEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ProductCategoryMapper implements IMapper<ProductCategoryEntity, ProductCategoryRequestDTO, ProductCategoryResponseDTO> {

    private final ModelMapper modelMapper;

    public ProductCategoryMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public ProductCategoryResponseDTO toDTO (ProductCategoryEntity entity){
        ProductCategoryResponseDTO dto = modelMapper.map(entity, ProductCategoryResponseDTO.class);
        return dto;
    }

    public ProductCategoryEntity toEntity (ProductCategoryRequestDTO dto){
        ProductCategoryEntity entity = modelMapper.map(dto, ProductCategoryEntity.class);
        return entity;
    }

}
