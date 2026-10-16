package com.jll.cibus.order.mapper;

import com.jll.cibus.common.model.IMapper;
import com.jll.cibus.order.dto.OrderStatusDTO;
import com.jll.cibus.order.entity.OrderStatusEntity;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderStatusMapper implements IMapper<OrderStatusEntity, OrderStatusDTO, OrderStatusDTO> {

    private final ModelMapper modelMapper;

    public OrderStatusDTO toDTO(OrderStatusEntity entity){
        return modelMapper.map(entity, OrderStatusDTO.class);
    }

    public OrderStatusEntity toEntity(OrderStatusDTO dto){
        return modelMapper.map(dto, OrderStatusEntity.class);
    }

}
