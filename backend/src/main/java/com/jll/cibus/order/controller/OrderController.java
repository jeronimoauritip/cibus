package com.jll.cibus.order.controller;

import com.jll.cibus.order.dto.OrderStatusDTO;
import com.jll.cibus.order.dto.OrderUpdateDTO;
import com.jll.cibus.order.service.OrderService;
import com.jll.cibus.order.dto.OrderRequestDTO;
import com.jll.cibus.order.dto.OrderResponseDTO;
import com.jll.cibus.payment.dto.DiscountRequestDTO;
import com.jll.cibus.payment.dto.PaymentDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/branches/{branchId}/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;


    @GetMapping
    public ResponseEntity<Page<OrderResponseDTO>> getAll(@PathVariable Long branchId,
                                                         @RequestParam(required = false) Long tableNumber,
                                                         @RequestParam(required = false) Long waiterId,
                                                         @RequestParam(required = false) String statusName,
                                                         @RequestParam(required = false) LocalDateTime from,
                                                         @RequestParam(required = false) LocalDateTime to,
                                                         @RequestParam(required = false) BigDecimal minTotal,
                                                         @RequestParam(required = false) BigDecimal maxTotal,
                                                         Pageable pageable){
        return ResponseEntity.ok(orderService.getAll(pageable, branchId, tableNumber, waiterId, statusName, from, to, minTotal, maxTotal));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> getById(@PathVariable Long branchId,@PathVariable Long orderId){
        return ResponseEntity.ok(orderService.findById(branchId,orderId));
    }

    @PostMapping()
    public ResponseEntity<OrderResponseDTO> create(@PathVariable Long branchId, @Valid @RequestBody OrderRequestDTO dto) {
        OrderResponseDTO response = orderService.create(branchId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{orderId}")
    public ResponseEntity<OrderResponseDTO> update(@PathVariable Long branchId, @PathVariable Long orderId, @Valid @RequestBody OrderUpdateDTO dto) {
        return ResponseEntity.ok(orderService.update(branchId, orderId, dto));
    }

    @PostMapping("/{orderId}/payments")
    public ResponseEntity<PaymentDTO> addPayment(@PathVariable Long branchId,@PathVariable Long orderId, @Valid @RequestBody PaymentDTO payment){
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.addPayment(branchId,orderId, payment));
    }

    @PatchMapping("/{orderId}/discount")
    public ResponseEntity<OrderResponseDTO> addDiscount(@PathVariable Long branchId,@PathVariable Long orderId, @Valid @RequestBody DiscountRequestDTO discount){
        return ResponseEntity.ok(orderService.applyDiscount(branchId,orderId, discount));
    }

    @GetMapping("/statuses")
    public ResponseEntity<List<OrderStatusDTO>> getStatuses(){
        return ResponseEntity.ok(orderService.getStatuses());
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDTO> setCancelStatus(@PathVariable Long branchId,@PathVariable Long orderId){
        return ResponseEntity.ok(orderService.changeStatusInBranch(branchId,orderId, "CANCELLED"));
    }

    @PostMapping("/{orderId}/ready")
    public ResponseEntity<OrderResponseDTO> setReadyStatus(@PathVariable Long branchId,@PathVariable Long orderId){
        return ResponseEntity.ok(orderService.changeStatusInBranch(branchId,orderId, "READY"));
    }

    @PostMapping("/{orderId}/serve")
    public ResponseEntity<OrderResponseDTO> setServedStatus(@PathVariable Long branchId,@PathVariable Long orderId){
        return ResponseEntity.ok(orderService.changeStatusInBranch(branchId,orderId, "SERVED"));
    }

}
