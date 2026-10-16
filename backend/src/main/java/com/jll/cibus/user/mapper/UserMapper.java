package com.jll.cibus.user.mapper;
import com.jll.cibus.common.model.IMapper;
import com.jll.cibus.user.dto.UserRequestDTO;
import com.jll.cibus.user.dto.UserResponseDTO;
import com.jll.cibus.user.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserMapper implements IMapper<UserEntity,UserRequestDTO,UserResponseDTO> {

    private final ModelMapper modelMapper;

    public UserEntity toEntity (UserRequestDTO dto) {
        return modelMapper.map(dto, UserEntity.class);
    }

    public UserResponseDTO toDTO (UserEntity entity) {
        UserResponseDTO dto =  modelMapper.map(entity, UserResponseDTO.class);
        if(entity.getBranch() != null){
            dto.setBranchId(entity.getBranch().getId());
            dto.setBranchName(entity.getBranch().getName());
        }
        dto.setRole(entity.getRole().getRole().name());
        return dto;
    }
}
