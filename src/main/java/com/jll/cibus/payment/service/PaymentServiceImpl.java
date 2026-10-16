package com.jll.cibus.payment.service;

import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.order.repository.OrderRepository;
import com.jll.cibus.order.service.OrderStatusService;
import com.jll.cibus.payment.dto.DiscountRequestDTO;
import com.jll.cibus.payment.dto.PaymentDTO;
import com.jll.cibus.payment.entity.OrderPaymentEntity;
import com.jll.cibus.payment.entity.PaymentMethodEntity;
import com.jll.cibus.payment.repository.OrderPaymentRepository;
import com.jll.cibus.payment.repository.PaymentMethodRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements  PaymentService{

    private final OrderPaymentRepository orderPaymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final OrderStatusService orderStatusService;
    private final OrderRepository orderRepository;

    @Override
    public List<OrderPaymentEntity> getPayments(Long orderId){
        return orderPaymentRepository.findByOrder_Id(orderId);
    }

    @Override
    public BigDecimal getTotalPaid(Long orderId) {                             //metodo para calcular y asignar al responseDTO lo que falta pagar de la orden.
        return getPayments(orderId)
                .stream()
                .map(OrderPaymentEntity::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional
    public PaymentDTO addPayment(OrderEntity order, PaymentDTO payment){
        if (payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Amount must be greater than zero");
        }
        BigDecimal totalPaid = getTotalPaid(order.getId());
        BigDecimal remainingAmount = order.getFinalTotal().subtract(totalPaid);
        if(payment.getAmount().compareTo(remainingAmount) > 0){
            throw new BusinessException("Payment amount exceeds remaining balance");
        }
        PaymentMethodEntity paymentMethod = paymentMethodRepository.findById(payment.getPaymentMethodId())
                .orElseThrow(() -> new ResourceNotFoundException("payment method ID", payment.getPaymentMethodId()));
        OrderPaymentEntity paymentEntity = OrderPaymentEntity.builder()
                .order(order)
                .paymentMethod(paymentMethod)
                .amount(payment.getAmount())
                .build();
        OrderPaymentEntity saved = orderPaymentRepository.save(paymentEntity);
        if (totalPaid.add(paymentEntity.getAmount()).compareTo(order.getFinalTotal()) >= 0) {
            orderStatusService.changeOrderStatus(order, "PAID");
            order.setClosedAt(LocalDateTime.now());
            orderRepository.save(order);
        }
        return PaymentDTO.builder()
                .paymentMethodId(saved.getPaymentMethod().getId())
                .amount(saved.getAmount())
                .build();
    }

    @Override
    @Transactional
    public OrderEntity applyDiscount(OrderEntity order, DiscountRequestDTO discount){
        if(discount.getAmount().compareTo(BigDecimal.ZERO) <= 0){
            throw new BusinessException("Discount must be greater than zero");
        }
        if(discount.getAmount().compareTo(order.getFinalTotal()) > 0){
            throw new BusinessException("Discount cannot exceed final total");
        }
        BigDecimal totalPaid = getTotalPaid(order.getId());
        BigDecimal remainingAmount = order.getFinalTotal().subtract(totalPaid);
        if (discount.getAmount().compareTo(remainingAmount) > 0) {
            throw new BusinessException("Discount cannot exceed remaining balance");
        }
        order.setDiscount(order.getDiscount().add(discount.getAmount()));
        order.setFinalTotal(order.getFinalTotal().subtract(discount.getAmount()));
        return orderRepository.save(order);
    }

}
