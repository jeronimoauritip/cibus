package com.jll.cibus.order.service;

import com.jll.cibus.order.dto.OrderRequestDTO;
import com.jll.cibus.order.dto.OrderResponseDTO;
import com.jll.cibus.order.dto.OrderStatusDTO;
import com.jll.cibus.order.dto.OrderUpdateDTO;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.payment.dto.DiscountRequestDTO;
import com.jll.cibus.payment.dto.PaymentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {
    void assertOrderInBranch(Long branchId, Long orderId);
    Page<OrderResponseDTO> getAll(Pageable pageable, Long branchId, Long tableNumber, Long waiterId, String statusName, LocalDateTime from, LocalDateTime to, BigDecimal minTotal, BigDecimal maxTotal);
    OrderResponseDTO findById(Long branchId, Long id);
    boolean existsById(Long orderId);
    Boolean productExistsInDetails(Long orderId, Long productId);
    OrderResponseDTO create(Long branchId, OrderRequestDTO dto);
    OrderResponseDTO update(Long branchId, Long orderId, OrderUpdateDTO dto);
    void delete(Long orderId);
    List<OrderStatusDTO> getStatuses();
    OrderResponseDTO changeStatus(Long orderId, String newStatus);
    Boolean isCancelled(OrderEntity order);
    Boolean isPaid(OrderEntity order);
    PaymentDTO addPayment(Long branchId, Long orderId, PaymentDTO payment);
    OrderResponseDTO applyDiscount(Long branchId, Long orderId, DiscountRequestDTO discount);
    OrderResponseDTO changeStatusInBranch(Long branchId, Long orderId, String newStatus);
    void recalculateTotals(Long id);
    void setRemainingAmount(OrderResponseDTO dto);
    Boolean hasPaymentsOrDiscounts(Long orderId);
}