package com.jll.cibus.statistics.service;

import com.jll.cibus.statistics.dto.order.OrderInsightDTO;
import com.jll.cibus.statistics.dto.overview.OverviewInsightDTO;
import com.jll.cibus.statistics.dto.product.ProductInsightDTO;
import com.jll.cibus.statistics.dto.table.TableInsightDTO;
import com.jll.cibus.statistics.dto.waiter.WaiterInsightDTO;

import java.time.LocalDateTime;

public interface StatisticsService {
    TableInsightDTO getTableInsights(Long branchId, LocalDateTime start, LocalDateTime end);
    ProductInsightDTO getProductInsights(Long branchId, LocalDateTime start, LocalDateTime end);
    ProductInsightDTO getGlobalProductInsights(LocalDateTime start, LocalDateTime end);
    OrderInsightDTO getOrderInsights(Long branchId, LocalDateTime start, LocalDateTime end);
    OrderInsightDTO getGlobalOrderInsights(LocalDateTime start, LocalDateTime end);
    WaiterInsightDTO getWaiterInsights(Long branchId, LocalDateTime start, LocalDateTime end);
    WaiterInsightDTO getGlobalWaiterInsights(LocalDateTime start, LocalDateTime end);
    OverviewInsightDTO getOverviewInsights(Long branchId, LocalDateTime start, LocalDateTime end);
    OverviewInsightDTO getGlobalOverviewInsights(LocalDateTime start, LocalDateTime end);
}