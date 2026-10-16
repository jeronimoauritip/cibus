package com.jll.cibus.product.mapper;

import com.jll.cibus.common.model.IMapper;
import com.jll.cibus.product.dto.ProductRequestDTO;
import com.jll.cibus.product.dto.ProductResponseDTO;
import com.jll.cibus.product.entity.ProductEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper implements IMapper<ProductEntity,ProductRequestDTO,ProductResponseDTO>
{
    private final ModelMapper modelMapper;

    public ProductMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public ProductEntity toEntity (ProductRequestDTO dto)
    {
        return modelMapper.map(dto, ProductEntity.class);
    }
    public ProductResponseDTO toDTO  (ProductEntity entity)
    {
        ProductResponseDTO dto = modelMapper.map(entity, ProductResponseDTO.class);
        dto.setCategoryName(entity.getCategory().getName());
        return dto;
    }
}
