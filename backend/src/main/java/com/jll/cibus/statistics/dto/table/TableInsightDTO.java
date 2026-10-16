package com.jll.cibus.statistics.dto.table;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TableInsightDTO {
    private TableMetricDTO mostBusyTable;
    private TableMetricDTO lessBusyTable;
    private Double occupancyRate;
}
