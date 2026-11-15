package com.jll.cibus.payment.dto;

import com.jll.cibus.order.dto.OrderResponseDTO;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TableBillDTO {
    private Long branchId;
    private String branchName;
    private Integer tableNumber;
    private Long waiterId;
    private String waiterFirstName;
    private String waiterLastName;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private Boolean allServed;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal finalTotal;
    private BigDecimal totalPaid;
    private BigDecimal remainingAmount;
    private List<OrderResponseDTO> orders;
    private List<PaymentDTO> payments;
}

