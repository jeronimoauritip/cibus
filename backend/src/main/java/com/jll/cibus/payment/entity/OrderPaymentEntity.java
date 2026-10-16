package com.jll.cibus.payment.entity;

import com.jll.cibus.order.entity.OrderEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_payments")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class OrderPaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paymentMethod_id", nullable = false)
    private PaymentMethodEntity paymentMethod;

    private BigDecimal amount;

}
