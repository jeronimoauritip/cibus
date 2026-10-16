package com.jll.cibus.statistics.dto.table;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TableMetricDTO {
    private Integer number;
    private Long orderCount;
}
