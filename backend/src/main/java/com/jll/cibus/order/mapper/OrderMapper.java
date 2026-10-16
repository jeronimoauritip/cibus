package com.jll.cibus.order.mapper;

import com.jll.cibus.common.model.IMapper;
import com.jll.cibus.order.dto.OrderRequestDTO;
import com.jll.cibus.order.dto.OrderResponseDTO;
import com.jll.cibus.order.dto.OrderUpdateDTO;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.orderdetail.dto.OrderDetailResponseDTO;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderMapper implements IMapper<OrderEntity, OrderRequestDTO, OrderResponseDTO> {

    private final ModelMapper modelMapper;

    @Override
    public OrderResponseDTO toDTO(OrderEntity entity){
        OrderResponseDTO dto = modelMapper.map(entity, OrderResponseDTO.class);
        dto.setBranchId(entity.getBranch().getId());
        dto.setBranchName(entity.getBranch().getName());
        dto.setTableNumber(entity.getTable().getNumber());
        dto.setWaiterId(entity.getWaiter().getId());
        dto.setWaiterFirstName(entity.getWaiter().getFirstName());
        dto.setWaiterLastName(entity.getWaiter().getLastName());
        dto.setStatus(entity.getStatus().getName());
        return dto;
    }

    @Override
    public OrderEntity toEntity(OrderRequestDTO dto){
        return modelMapper.map(dto, OrderEntity.class);
    }

    public OrderEntity toEntity(OrderUpdateDTO dto){
        return modelMapper.map(dto, OrderEntity.class);
    }

}
