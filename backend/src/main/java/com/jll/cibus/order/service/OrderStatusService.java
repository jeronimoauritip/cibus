package com.jll.cibus.order.service;

import com.jll.cibus.order.dto.OrderStatusDTO;
import com.jll.cibus.order.entity.OrderEntity;

import java.util.List;

public interface OrderStatusService {
    List<OrderStatusDTO> findAll();
    void changeOrderStatus(OrderEntity order, String newStatus);
}