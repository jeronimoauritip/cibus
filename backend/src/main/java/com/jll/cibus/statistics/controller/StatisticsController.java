package com.jll.cibus.statistics.controller;

import com.jll.cibus.statistics.dto.order.OrderInsightDTO;
import com.jll.cibus.statistics.dto.overview.OverviewInsightDTO;
import com.jll.cibus.statistics.dto.product.ProductInsightDTO;
import com.jll.cibus.statistics.dto.table.TableInsightDTO;
import com.jll.cibus.statistics.dto.waiter.WaiterInsightDTO;
import com.jll.cibus.statistics.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;


    @GetMapping("/global/overview")
    public ResponseEntity<OverviewInsightDTO> getGlobalOverviewInsights(@RequestParam(required = false) LocalDateTime start,
                                                                        @RequestParam(required = false) LocalDateTime end){


        return ResponseEntity.ok(statisticsService.getGlobalOverviewInsights(start, end));
    }

    @GetMapping("/branch/{branchId}/overview")
    public ResponseEntity<OverviewInsightDTO> getOverviewInsights(@PathVariable Long branchId,
                                                                  @RequestParam(required = false) LocalDateTime start,
                                                                  @RequestParam(required = false) LocalDateTime end){

        return ResponseEntity.ok(statisticsService.getOverviewInsights(branchId, start, end));
    }

    @GetMapping("/branch/{branchId}/tables")
    public ResponseEntity<TableInsightDTO> getTableInsights(@PathVariable Long branchId,
                                                            @RequestParam(required = false) LocalDateTime start,
                                                            @RequestParam(required = false) LocalDateTime end) {

        return ResponseEntity.ok(statisticsService.getTableInsights(branchId, start, end));
    }

    @GetMapping("/branch/{branchId}/products")
    public ResponseEntity<ProductInsightDTO> getProductInsights(@PathVariable Long branchId,
                                                                @RequestParam(required = false) LocalDateTime start,
                                                                @RequestParam(required = false) LocalDateTime end) {

        return ResponseEntity.ok(statisticsService.getProductInsights(branchId, start, end));
    }

    @GetMapping("/global/products")
    public ResponseEntity<ProductInsightDTO> getGlobalProductInsights(@RequestParam(required = false) LocalDateTime start,
                                                                      @RequestParam(required = false) LocalDateTime end) {

        return ResponseEntity.ok(statisticsService.getGlobalProductInsights(start, end));
    }

    @GetMapping("/branch/{branchId}/orders")
    public ResponseEntity<OrderInsightDTO> getOrderInsights(@PathVariable Long branchId,
                                                            @RequestParam(required = false) LocalDateTime start,
                                                            @RequestParam(required = false) LocalDateTime end){

        return ResponseEntity.ok(statisticsService.getOrderInsights(branchId, start, end));
    }

    @GetMapping("/global/orders")
    public ResponseEntity<OrderInsightDTO> getGlobalOrderInsights(@RequestParam(required = false) LocalDateTime start,
                                                                  @RequestParam(required = false) LocalDateTime end){


        return ResponseEntity.ok(statisticsService.getGlobalOrderInsights(start, end));
    }

    @GetMapping("/branch/{branchId}/waiters")
    public ResponseEntity<WaiterInsightDTO> getWaiterInsights(@PathVariable Long branchId,
                                                              @RequestParam(required = false) LocalDateTime start,
                                                              @RequestParam(required = false) LocalDateTime end){

        return ResponseEntity.ok(statisticsService.getWaiterInsights(branchId, start, end));
    }

    @GetMapping("/global/waiters")
    public ResponseEntity<WaiterInsightDTO> getGlobalWaiterInsights(@RequestParam(required = false) LocalDateTime start,
                                                                    @RequestParam(required = false) LocalDateTime end){


        return ResponseEntity.ok(statisticsService.getGlobalWaiterInsights(start, end));
    }
}
