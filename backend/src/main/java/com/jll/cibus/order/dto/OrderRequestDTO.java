package com.jll.cibus.order.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class OrderRequestDTO {

    @NotNull(message = "Table is required")
    @Positive
    private Integer tableNumber;

    @NotNull(message = "Waiter is required")
    @Positive
    private Long waiterId;

}
