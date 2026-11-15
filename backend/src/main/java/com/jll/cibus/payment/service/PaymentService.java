package com.jll.cibus.payment.service;

import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.payment.dto.DiscountRequestDTO;
import com.jll.cibus.payment.dto.PaymentDTO;
import com.jll.cibus.payment.entity.OrderPaymentEntity;
import com.jll.cibus.payment.entity.PaymentMethodEntity;

import java.math.BigDecimal;
import java.util.List;

public interface PaymentService {
    List<OrderPaymentEntity> getPayments(Long orderId);
    BigDecimal getTotalPaid(Long orderId);
    PaymentMethodEntity getPaymentMethod(Long paymentMethodId);
    OrderPaymentEntity registerPaymentSlice(OrderEntity order, PaymentMethodEntity paymentMethod, BigDecimal amount);
    PaymentDTO addPayment(OrderEntity order, PaymentDTO payment);
    OrderEntity applyDiscount(OrderEntity order, DiscountRequestDTO discount);
}