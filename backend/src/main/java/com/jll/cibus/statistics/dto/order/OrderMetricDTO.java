package com.jll.cibus.statistics.dto.order;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderMetricDTO {
    private Long orderId;
    private Long branchId;
    private Long tableId;
    private String WaiterName;
    private BigDecimal ticketValue;
    private LocalDateTime orderDate;
}
