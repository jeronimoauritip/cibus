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
        return modelMapper.map(dto, TableEntity.class);
    }

    public TableEntity toEntity(TableCreateDTO dto) {
        return modelMapper.map(dto, TableEntity.class);
    }

    public TableResponseDTO toDTO(TableEntity entity) {
        TableResponseDTO dto = modelMapper.map(entity, TableResponseDTO.class);
        dto.setBranchId(entity.getBranch().getId());
        if(entity.getWaiter()!= null){
            dto.setWaiterId(entity.getWaiter().getId());
        }
        return dto;
    }
}
