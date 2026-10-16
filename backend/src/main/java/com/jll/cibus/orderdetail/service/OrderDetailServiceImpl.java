package com.jll.cibus.orderdetail.service;

import com.jll.cibus.branchproduct.entity.BranchProductEntity;
import com.jll.cibus.branchproduct.service.BranchProductService;
import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.order.repository.OrderRepository;
import com.jll.cibus.order.service.OrderService;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.orderdetail.dto.OrderDetailRequestDTO;
import com.jll.cibus.orderdetail.dto.OrderDetailResponseDTO;
import com.jll.cibus.orderdetail.dto.OrderDetailUpdateDTO;
import com.jll.cibus.orderdetail.entity.OrderDetailEntity;
import com.jll.cibus.orderdetail.mapper.OrderDetailMapper;
import com.jll.cibus.orderdetail.repository.OrderDetailRepository;
import com.jll.cibus.product.entity.ProductEntity;
import com.jll.cibus.product.repository.ProductRepository;
import com.jll.cibus.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderDetailServiceImpl implements OrderDetailService {

    private final OrderDetailRepository orderDetailRepository;
    private final OrderDetailMapper orderDetailMapper;
    private final ProductService productService;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final BranchProductService branchProductService;
    private final ProductRepository productRepository;

    private void validateAvailability(BranchProductEntity productInBranch){
        if(!productInBranch.isAvailable()){
            throw new BusinessException("The product is not available in this branch.");
        }
    }
    @Override
    public List<OrderDetailResponseDTO> findAll() {                   //probablemente va a quedar sin uso
        List<OrderDetailEntity> orderDetails = orderDetailRepository.findAll();
        return orderDetails.stream()
                .map(orderDetailMapper::toDTO)
                .toList();
    }
    @Override
    public List<OrderDetailResponseDTO> getByOrderId (Long branchId,Long orderId){
        orderService.assertOrderInBranch(branchId, orderId);
        orderRepository.findById(orderId)
                .orElseThrow(()-> new ResourceNotFoundException("order",orderId));
        List<OrderDetailEntity> entities = orderDetailRepository.findByOrderId(orderId);
        return entities.stream()
                .map(orderDetailMapper::toDTO)
                .toList();
    }

    private OrderDetailEntity getEntityByOrderIdAndProductId(Long branchId, Long orderId, Long productId){
        orderService.assertOrderInBranch(branchId,orderId);
        if(!orderService.existsById(orderId)){
            throw new ResourceNotFoundException("order ID", orderId);
        }
        if(!productService.existsById(productId)){
            throw new ResourceNotFoundException("product ID", productId);
        }
        return orderDetailRepository.findByOrderIdAndProductId(orderId, productId)
                .orElseThrow(() -> new ResourceNotFoundException("detail of product", productId));
    }
    @Override
    public OrderDetailResponseDTO getByOrderIdAndProductId (Long branchId,Long orderId, Long productId){
        return orderDetailMapper.toDTO(getEntityByOrderIdAndProductId(branchId,orderId, productId));
    }

    private void validateOrderCanBeModified(Long branchId, Long orderId){
        orderService.assertOrderInBranch(branchId, orderId);
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("order", orderId));
        if (orderService.isPaid(order) || orderService.isCancelled(order)) {
            throw new BusinessException("This order can not be modified " + orderId
                    + " because it is " + order.getStatus().getName());
        }
        if (orderService.hasPaymentsOrDiscounts(orderId)) {
            throw new BusinessException("You can't modify an order with payments or discounts");
        }
    }
    @Override
    @Transactional
    public OrderDetailResponseDTO create(Long branchId, Long orderId, OrderDetailRequestDTO dto) {
        validateOrderCanBeModified(branchId, orderId);
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("order", orderId));

        ProductEntity product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("product", dto.getProductId()));
        BranchProductEntity productInBranch =
                branchProductService.getEntityByBranchAndProduct(order.getBranch().getId(), product.getId());
        validateAvailability(productInBranch);

        OrderDetailEntity existing = orderDetailRepository
                .findByOrderIdAndProductId(orderId, product.getId())
                .orElse(null);

        OrderDetailEntity detail;
        if (existing != null) {                                   // ya existe → sumo cantidad
            existing.setQuantity(existing.getQuantity() + dto.getQuantity());
            detail = existing;
        } else {                                                  // nuevo
            detail = OrderDetailEntity.builder()
                    .order(order)
                    .product(product)
                    .quantity(dto.getQuantity())
                    .unitPrice(productInBranch.getPrice())
                    .observation(dto.getObservation() == null ? "" : dto.getObservation())
                    .build();
        }

        OrderDetailEntity saved = orderDetailRepository.save(detail);

        if (!order.getStatus().getName().equalsIgnoreCase("PREPARING")) {
            orderService.changeStatus(orderId, "PREPARING");
        }
        orderService.recalculateTotals(orderId);
        return orderDetailMapper.toDTO(saved);
    }
    @Override
    @Transactional
    public OrderDetailResponseDTO update (Long branchId, Long orderId, Long productId, OrderDetailUpdateDTO dto){
        validateOrderCanBeModified(branchId, orderId);
        OrderDetailEntity entity = getEntityByOrderIdAndProductId(branchId, orderId, productId);
        OrderEntity order = orderRepository.findById(orderId)
                        .orElseThrow(()->new ResourceNotFoundException("order", orderId));
        entity.setOrder(order);
        if(dto.getObservation() != null){
            entity.setObservation(dto.getObservation());
        }
        if(dto.getQuantity() != null){
            entity.setQuantity(dto.getQuantity());
        }
        OrderDetailEntity saved = orderDetailRepository.save(entity);
        orderService.recalculateTotals(entity.getOrder().getId());
        return orderDetailMapper.toDTO(saved);
    }
    @Override
    @Transactional
    public void delete(Long branchId,Long orderId, Long productId){
        validateOrderCanBeModified(branchId, orderId);
        OrderDetailEntity entity = getEntityByOrderIdAndProductId(branchId,orderId, productId);
        orderDetailRepository.delete(entity);
        orderService.recalculateTotals(entity.getOrder().getId());
    }

}
