package com.jll.cibus.orderdetail.mapper;

import com.jll.cibus.common.model.IMapper;
import com.jll.cibus.orderdetail.dto.OrderDetailRequestDTO;
import com.jll.cibus.orderdetail.dto.OrderDetailResponseDTO;
import com.jll.cibus.orderdetail.entity.OrderDetailEntity;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class OrderDetailMapper implements IMapper<OrderDetailEntity, OrderDetailRequestDTO, OrderDetailResponseDTO> {

    private final ModelMapper modelMapper;

    @Override
    public OrderDetailResponseDTO toDTO(OrderDetailEntity entity){
        OrderDetailResponseDTO dto = modelMapper.map(entity, OrderDetailResponseDTO.class);
        dto.setProductId(entity.getProduct().getId());
        dto.setProductName(entity.getProduct().getName());
        dto.setSubtotal(entity.getUnitPrice().multiply(BigDecimal.valueOf(entity.getQuantity())));
        return dto;
    }

    @Override
    public OrderDetailEntity toEntity(OrderDetailRequestDTO dto){
        return modelMapper.map(dto, OrderDetailEntity.class);
    }

}
