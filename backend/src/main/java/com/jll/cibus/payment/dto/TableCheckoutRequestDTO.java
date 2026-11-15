package com.jll.cibus.payment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TableCheckoutRequestDTO {

    private List<Long> orderIds;

    @PositiveOrZero
    private BigDecimal discount;

    @NotEmpty
    @Valid
    private List<PaymentDTO> payments;
}

