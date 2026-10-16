package com.jll.cibus.payment.controller;

import com.jll.cibus.payment.dto.PaymentMethodRequestDTO;
import com.jll.cibus.payment.dto.PaymentMethodResponseDTO;
import com.jll.cibus.payment.service.PaymentMethodService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    public ResponseEntity<List<PaymentMethodResponseDTO>> findAll(){
        return ResponseEntity.ok(paymentMethodService.findAll());
    }

    @GetMapping("/{paymentMethodId}")
    public ResponseEntity<PaymentMethodResponseDTO> findById(@PathVariable Long paymentMethodId){
        return ResponseEntity.ok(paymentMethodService.findById(paymentMethodId));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<PaymentMethodResponseDTO>> findByName(@PathVariable String name){
        return ResponseEntity.ok(paymentMethodService.findByName(name));
    }

    @PostMapping
    public ResponseEntity<PaymentMethodResponseDTO> create(@Valid @RequestBody PaymentMethodRequestDTO dto) {
        PaymentMethodResponseDTO response = paymentMethodService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{paymentMethodId}")
    public ResponseEntity<PaymentMethodResponseDTO> update(@PathVariable Long paymentMethodId, @Valid @RequestBody PaymentMethodRequestDTO dto) {
        return ResponseEntity.ok(paymentMethodService.update(paymentMethodId, dto));
    }

    @DeleteMapping("/{paymentMethodId}")
    public ResponseEntity<Void> delete(@PathVariable Long paymentMethodId) {
        paymentMethodService.delete(paymentMethodId);
        return ResponseEntity.noContent().build();
    }


}
