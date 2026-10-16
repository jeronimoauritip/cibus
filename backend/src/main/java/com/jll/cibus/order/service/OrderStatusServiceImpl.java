package com.jll.cibus.order.service;

import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.order.dto.OrderStatusDTO;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.order.entity.OrderStatusEntity;
import com.jll.cibus.order.mapper.OrderStatusMapper;
import com.jll.cibus.order.repository.OrderStatusRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderStatusServiceImpl implements OrderStatusService{

    private final OrderStatusRepository orderStatusRepository;
    private final OrderStatusMapper orderStatusMapper;

    @Override
    public List<OrderStatusDTO> findAll(){
        return orderStatusRepository.findAll().stream()
                .map(orderStatusMapper::toDTO)
                .toList();
    }

    private void validateTransition(String current, String next) {
        switch (current) {
            case "PENDING":
                if (!next.equalsIgnoreCase("PREPARING") && !next.equalsIgnoreCase("CANCELLED"))
                    throw new BusinessException("Invalid status transition");
                break;
            case "PREPARING":
                if (!next.equalsIgnoreCase("READY") && !next.equalsIgnoreCase("CANCELLED"))
                    throw new BusinessException("Invalid status transition");
                break;
            case "READY":
                if (!next.equalsIgnoreCase("SERVED") && !next.equalsIgnoreCase("PREPARING") && !next.equalsIgnoreCase("CANCELLED"))
                    throw new BusinessException("Invalid status transition");
                break;
            case "SERVED":
                if (!next.equalsIgnoreCase("PAID") && !next.equalsIgnoreCase("PREPARING") && !next.equalsIgnoreCase("CANCELLED"))
                    throw new BusinessException("Invalid status transition");
                break;
            case "PAID", "CANCELLED":
                throw new BusinessException("Order can no longer change status");
        }
    }
    @Override
    @Transactional
    public void changeOrderStatus(OrderEntity order, String newStatus) {
        String currentStatus = order.getStatus() == null
                ? "CREATED"
                : order.getStatus().getName();
        OrderStatusEntity orderStatus = orderStatusRepository.findByName(newStatus)
                .orElseThrow(() -> new ResourceNotFoundException("Status not found"));
        validateTransition(currentStatus, newStatus);
        order.setStatus(orderStatus);
    }

}
