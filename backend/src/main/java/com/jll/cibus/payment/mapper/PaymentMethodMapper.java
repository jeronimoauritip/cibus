package com.jll.cibus.payment.mapper;

import com.jll.cibus.common.model.IMapper;
import com.jll.cibus.payment.dto.PaymentMethodRequestDTO;
import com.jll.cibus.payment.dto.PaymentMethodResponseDTO;
import com.jll.cibus.payment.entity.PaymentMethodEntity;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentMethodMapper implements IMapper<PaymentMethodEntity,PaymentMethodRequestDTO, PaymentMethodResponseDTO> {

    private final ModelMapper modelMapper;

    public PaymentMethodEntity toEntity(PaymentMethodRequestDTO dto){
        return modelMapper.map(dto, PaymentMethodEntity.class);
    }

    public PaymentMethodResponseDTO toDTO(PaymentMethodEntity entity){
        return modelMapper.map(entity, PaymentMethodResponseDTO.class);
    }

}
