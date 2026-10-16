package com.jll.cibus.payment.repository;

import com.jll.cibus.payment.entity.OrderPaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderPaymentRepository extends JpaRepository<OrderPaymentEntity, Long> {

    public List<OrderPaymentEntity> findByOrder_Id(Long orderId);

    public Optional<OrderPaymentEntity> findByOrder_IdAndPaymentMethod_Id(Long orderId, Long paymentId);

}
