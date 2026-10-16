package com.jll.cibus.statistics.dto.waiter;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WaiterMetricDTO {
    private Long dni;
    private String firstName;
    private String lastName;
    private String branchName;
    private BigDecimal facturation;
    private Long ordersServed;
}
