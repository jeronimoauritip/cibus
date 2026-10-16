package com.jll.cibus.branchproduct.mapper;

import com.jll.cibus.branchproduct.dto.BranchProductRequestDTO;
import com.jll.cibus.branchproduct.dto.BranchProductResponseDTO;
import com.jll.cibus.branchproduct.dto.BranchProductUpdateDTO;
import com.jll.cibus.branchproduct.entity.BranchProductEntity;
import com.jll.cibus.common.model.IMapper;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class BranchProductMapper implements IMapper<BranchProductEntity, BranchProductRequestDTO, BranchProductResponseDTO> {

    private final ModelMapper modelMapper;

    public BranchProductMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public BranchProductResponseDTO toDTO (BranchProductEntity entity){
        BranchProductResponseDTO dto = modelMapper.map(entity, BranchProductResponseDTO.class);
        dto.setBranchId(entity.getBranch().getId());
        dto.setBranchName(entity.getBranch().getName());
        dto.setProductId(entity.getProduct().getId());
        dto.setProductName(entity.getProduct().getName());
        return dto;
    }

    public BranchProductUpdateDTO toUpdateDTO(BranchProductEntity entity){
        return modelMapper.map(entity, BranchProductUpdateDTO.class);
    }

    public BranchProductEntity toEntity (BranchProductRequestDTO dto){
        return modelMapper.map(dto, BranchProductEntity.class);
    }

}
