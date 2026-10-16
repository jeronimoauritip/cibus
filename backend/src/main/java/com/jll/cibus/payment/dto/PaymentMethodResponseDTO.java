package com.jll.cibus.payment.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PaymentMethodResponseDTO {

    private Long id;
    private String name;

}
