package com.jll.cibus.orderdetail.service;

import com.jll.cibus.orderdetail.dto.OrderDetailRequestDTO;
import com.jll.cibus.orderdetail.dto.OrderDetailResponseDTO;
import com.jll.cibus.orderdetail.dto.OrderDetailUpdateDTO;

import java.util.List;

public interface OrderDetailService {
    List<OrderDetailResponseDTO> findAll();
    List<OrderDetailResponseDTO> getByOrderId(Long branchId, Long orderId);
    OrderDetailResponseDTO getByOrderIdAndProductId(Long branchId, Long orderId, Long productId);
    OrderDetailResponseDTO create(Long branchId, Long orderId, OrderDetailRequestDTO dto);
    OrderDetailResponseDTO update(Long branchId, Long orderId, Long productId, OrderDetailUpdateDTO dto);
    void delete(Long branchId, Long orderId, Long productId);
}