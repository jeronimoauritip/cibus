package com.jll.cibus.branch.mapper;

import com.jll.cibus.branch.dto.BranchRequestDTO;
import com.jll.cibus.branch.dto.BranchResponseDTO;
import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.common.model.IMapper;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class BranchMapper implements IMapper<BranchEntity,BranchRequestDTO,BranchResponseDTO>
{
    private final ModelMapper modelMapper;

    public BranchMapper(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    public BranchEntity toEntity (BranchRequestDTO dto)
    {
        return modelMapper.map(dto, BranchEntity.class);
    }
    public BranchResponseDTO toDTO (BranchEntity entity)
    {
        return modelMapper.map(entity, BranchResponseDTO.class);
    }

}