package com.jll.cibus.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDTO {

    @NotNull
    @Positive
    private Long paymentMethodId;

    @NotNull
    @Positive
    private BigDecimal amount;

}
