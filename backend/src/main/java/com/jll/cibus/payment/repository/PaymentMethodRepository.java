package com.jll.cibus.payment.repository;

import com.jll.cibus.payment.entity.PaymentMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethodEntity, Long> {

    public Optional<PaymentMethodEntity> findByName(String name);

    public List<PaymentMethodEntity> findByNameContaining(String name);

    public boolean existsByName(String name);
}
