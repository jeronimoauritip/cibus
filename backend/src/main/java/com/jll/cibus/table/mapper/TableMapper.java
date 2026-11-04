package com.jll.cibus.table.mapper;

import com.jll.cibus.common.model.IMapper;
import com.jll.cibus.table.dto.TableCreateDTO;
import com.jll.cibus.table.dto.TableUpdateDTO;
import com.jll.cibus.table.dto.TableResponseDTO;
import com.jll.cibus.table.entity.TableEntity;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TableMapper implements IMapper<TableEntity,TableCreateDTO,TableResponseDTO> {

    private final ModelMapper modelMapper;

    public TableEntity toEntity(TableUpdateDTO dto) {
        TableEntity entity = modelMapper.map(dto, TableEntity.class);
        if (dto.getShape() != null && !dto.getShape().isBlank()) {
            entity.setShape(dto.getShape().toUpperCase());
        }
        return entity;
    }

    public TableEntity toEntity(TableCreateDTO dto) {
        TableEntity entity = modelMapper.map(dto, TableEntity.class);
        if (dto.getShape() != null && !dto.getShape().isBlank()) {
            entity.setShape(dto.getShape().toUpperCase());
        } else {
            entity.setShape("ROUND");
        }
        return entity;
    }

    public TableResponseDTO toDTO(TableEntity entity) {
        TableResponseDTO dto = modelMapper.map(entity, TableResponseDTO.class);
        dto.setBranchId(entity.getBranch().getId());
        dto.setShape(entity.getShape() != null ? entity.getShape() : "ROUND");
        if(entity.getWaiter()!= null){
            dto.setWaiterId(entity.getWaiter().getId());
        }
        return dto;
    }
}
