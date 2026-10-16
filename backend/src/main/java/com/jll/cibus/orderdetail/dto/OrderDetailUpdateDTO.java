package com.jll.cibus.orderdetail.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderDetailUpdateDTO {

    private String observation;

    @Min(value = 1)
    private Integer quantity;

}
