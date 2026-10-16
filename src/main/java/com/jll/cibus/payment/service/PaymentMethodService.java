package com.jll.cibus.payment.service;

import com.jll.cibus.payment.dto.PaymentMethodRequestDTO;
import com.jll.cibus.payment.dto.PaymentMethodResponseDTO;

import java.util.List;

public interface PaymentMethodService {
    List<PaymentMethodResponseDTO> findAll();
    PaymentMethodResponseDTO findById(Long id);
    List<PaymentMethodResponseDTO> findByName(String name);
    void existsByName(String name);
    PaymentMethodResponseDTO create(PaymentMethodRequestDTO newPayment);
    PaymentMethodResponseDTO update(Long id, PaymentMethodRequestDTO newPayment);
    void delete(Long id);
}