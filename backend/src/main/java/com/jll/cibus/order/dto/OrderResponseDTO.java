package com.jll.cibus.order.dto;

import com.jll.cibus.orderdetail.dto.OrderDetailResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class OrderResponseDTO {
    private Long id;
    private Long branchId;
    private String branchName;
    private Integer tableNumber;
    private Long waiterId;
    private String waiterFirstName;
    private String waiterLastName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal finalTotal;
    private BigDecimal remainingAmount;
    private List<OrderDetailResponseDTO> items;
}
