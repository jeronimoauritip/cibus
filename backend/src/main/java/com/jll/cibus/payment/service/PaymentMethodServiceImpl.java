package com.jll.cibus.payment.service;

import com.jll.cibus.common.exception.ResourceAlreadyExistsException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.payment.dto.PaymentMethodRequestDTO;
import com.jll.cibus.payment.dto.PaymentMethodResponseDTO;
import com.jll.cibus.payment.entity.PaymentMethodEntity;
import com.jll.cibus.payment.mapper.PaymentMethodMapper;
import com.jll.cibus.payment.repository.PaymentMethodRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentMethodServiceImpl implements PaymentMethodService{

    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentMethodMapper paymentMethodMapper;

    @Override
    public List<PaymentMethodResponseDTO> findAll(){
        List<PaymentMethodEntity> payments = paymentMethodRepository.findAll();
        return payments.stream()
                .map(paymentMethodMapper::toDTO)
                .toList();
    }

    private PaymentMethodEntity getEntity(Long id){
        return paymentMethodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id",id));
    }

    private PaymentMethodEntity getEntityByName(String name){
        return paymentMethodRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("name",name));
    }

    @Override
    public PaymentMethodResponseDTO findById(Long id){
        PaymentMethodEntity payment = getEntity(id);
        return paymentMethodMapper.toDTO(payment);
    }

    @Override
    public List<PaymentMethodResponseDTO> findByName(String name){
        List<PaymentMethodEntity> payments = paymentMethodRepository.findByNameContaining(name);
        return payments.stream()
                .map(paymentMethodMapper::toDTO)
                .toList();
    }

    @Override
    public void existsByName(String name){
        if(paymentMethodRepository.existsByName(name)){
            throw new ResourceAlreadyExistsException("name", name);
        }
    }

    @Override
    @Transactional
    public PaymentMethodResponseDTO create(PaymentMethodRequestDTO newPayment){
        existsByName(newPayment.getName());
        PaymentMethodEntity payment = paymentMethodMapper.toEntity(newPayment);
        PaymentMethodEntity saved = paymentMethodRepository.save(payment);
        return paymentMethodMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public PaymentMethodResponseDTO update(Long id, PaymentMethodRequestDTO newPayment){
        existsByName(newPayment.getName());
        PaymentMethodEntity payment = getEntity(id);
        payment.setName(newPayment.getName());
        PaymentMethodEntity saved = paymentMethodRepository.save(payment);
        return paymentMethodMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void delete(Long id){
        PaymentMethodEntity payment = getEntity(id);
        paymentMethodRepository.delete(payment);
    }

}
