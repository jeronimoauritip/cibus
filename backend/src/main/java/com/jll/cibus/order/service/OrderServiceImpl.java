package com.jll.cibus.order.service;

import com.jll.cibus.auth.AuthService;
import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.order.dto.OrderStatusDTO;
import com.jll.cibus.order.dto.OrderUpdateDTO;
import com.jll.cibus.order.dto.OrderRequestDTO;
import com.jll.cibus.order.dto.OrderResponseDTO;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.order.mapper.OrderMapper;
import com.jll.cibus.order.repository.OrderRepository;
import com.jll.cibus.order.specification.OrderSpecification;
import com.jll.cibus.orderdetail.entity.OrderDetailEntity;
import com.jll.cibus.orderdetail.mapper.OrderDetailMapper;
import com.jll.cibus.orderdetail.repository.OrderDetailRepository;
import com.jll.cibus.payment.dto.DiscountRequestDTO;
import com.jll.cibus.payment.dto.PaymentDTO;
import com.jll.cibus.payment.service.PaymentService;
import com.jll.cibus.credential.entity.CredentialsEntity;
import com.jll.cibus.credential.repository.CredentialsRepository;
import com.jll.cibus.role.enums.Roles;
import com.jll.cibus.table.repository.TableRepository;
import com.jll.cibus.table.service.TableService;
import com.jll.cibus.table.entity.TableEntity;
import com.jll.cibus.user.entity.UserEntity;
import com.jll.cibus.user.repository.UserRepository;
import com.jll.cibus.user.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.PredicateSpecification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderMapper orderMapper;
    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderDetailMapper orderDetailMapper;
    private final OrderStatusService orderStatusService;
    private final UserService userService;
    private final TableService tableService;
    private final TableRepository tableRepository;
    private final BranchRepository branchRepository;
    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final CredentialsRepository credentialsRepository;
    private final AuthService authService;


    private void authenticateUserBelongsInBranch(Long branchId){
        if(!branchRepository.existsById(branchId)){
            throw new ResourceNotFoundException("branch ID", branchId);
        }
        authService.authenticateUserBelongsInBranch(branchId);
    }

    @Override
    public void assertOrderInBranch (Long branchId, Long orderId) {
        authenticateUserBelongsInBranch(branchId);
        OrderEntity order = getEntity(orderId);
        if (!order.getBranch().getId().equals(branchId)) {
            throw new ResourceNotFoundException("order", orderId);
        }
    }


    @Override
    public Page<OrderResponseDTO> getAll(Pageable pageable, Long branchId, Long tableNumber, Long waiterId, String statusName, LocalDateTime from, LocalDateTime to, BigDecimal minTotal, BigDecimal maxTotal) {
        authenticateUserBelongsInBranch(branchId);
        if (from != null && to != null && from.isAfter(to)) {
            throw new BusinessException("The start date cannot be after the end date");
        }
        if (minTotal != null && maxTotal != null && minTotal.compareTo(maxTotal) > 0) {
            throw new BusinessException("The minimum total cannot be greater than the maximum total");
        }
        PredicateSpecification<OrderEntity> spec = PredicateSpecification.allOf(
                OrderSpecification.equalsBranchId(branchId),
                OrderSpecification.equalsTableNumber(tableNumber),
                OrderSpecification.equalsWaiterId(waiterId),
                OrderSpecification.equalsStatus(statusName),
                OrderSpecification.dateTimeAfter(from),
                OrderSpecification.dateTimeBefore(to),
                OrderSpecification.totalGreaterThanOrEqual(minTotal),
                OrderSpecification.totalLessThanOrEqual(maxTotal)
        );
        return orderRepository.findBy(spec, query -> query.page(pageable))
                .map(order -> {
                    OrderResponseDTO dto = orderMapper.toDTO(order);
                    setResponseItems(dto);
                    setRemainingAmount(dto);
                    return dto;
                });
    }

    private OrderEntity getEntity(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("ID", orderId));
    }

    @Override
    public OrderResponseDTO findById(Long branchId, Long id) {
        assertOrderInBranch(branchId, id);
        OrderEntity order = getEntity(id);
        OrderResponseDTO response = orderMapper.toDTO(order);
        setResponseItems(response);
        setRemainingAmount(response);
        return response;
    }

    private List<OrderDetailEntity> getItems(Long id) {
        return orderDetailRepository.findByOrderId(id);
    }

    private void setResponseItems(OrderResponseDTO order) {                         //Metodo para agregarle al ResponseDTO los detalles de la orden
        List<OrderDetailEntity> items = getItems(order.getId());
        order.setItems(items.stream()
                .map(orderDetailMapper::toDTO)
                .toList());
    }

    @Override
    public boolean existsById(Long orderId) {
        return orderRepository.existsById(orderId);
    }

    private void validateOrderRequest(Long branchId, OrderRequestDTO dto) {
        if (!userRepository.existsById(dto.getWaiterId()))
            throw new ResourceNotFoundException("User ID" + dto.getWaiterId());

        CredentialsEntity waiterCredentials = credentialsRepository
                .findByUser_Id(dto.getWaiterId())
                .orElseThrow(() -> new BusinessException("The user with id " + dto.getWaiterId() + " has no credentials"));

        boolean isWaiter = waiterCredentials.getUser() != null
                && waiterCredentials.getUser().getRole().getRole() == Roles.WAITER;

        if (!isWaiter)
            throw new BusinessException("The user with id " + dto.getWaiterId() + " is not a waiter");

        if (!tableRepository.existsByBranchIdAndNumber(branchId, dto.getTableNumber()))
            throw new ResourceNotFoundException("Table number ", dto.getTableNumber());
    }

    @Override
    public Boolean productExistsInDetails(Long orderId, Long productId) {
        return getItems(orderId).stream()
                .anyMatch(item -> item.getProduct().getId().equals(productId));
    }

    @Override
    @Transactional
    public OrderResponseDTO create(Long branchId, OrderRequestDTO dto) {
        authenticateUserBelongsInBranch(branchId);
        validateOrderRequest(branchId, dto);
        BranchEntity branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("branch", branchId));
        TableEntity table = tableRepository.findByBranch_IdAndNumber(branchId, dto.getTableNumber())
                .orElseThrow(() -> new ResourceNotFoundException("There is no table number "+dto.getTableNumber()+"in this branch"));
        UserEntity waiter = userRepository.findById(dto.getWaiterId())
                .orElseThrow(()->new ResourceNotFoundException("user",dto.getWaiterId()));
        //VERIFICO QUE SEA WAITER
        //VERIFICAR QUE EN ESE MOMENTO LA MESA TENGA ASIGNADO A ESE WAITER
        if (table.getWaiter() == null || !table.getWaiter().getId().equals(waiter.getId())) {
            throw new BusinessException(waiter.getFirstName() + " is not working with table n " + table.getNumber());
        }
        OrderEntity order = orderMapper.toEntity(dto);
        order.setBranch(branch);
        order.setTable(table);
        order.setWaiter(waiter);
        orderStatusService.changeOrderStatus(order, "PENDING");
        order.setCreatedAt(LocalDateTime.now());
        order.setSubtotal(BigDecimal.ZERO);
        order.setDiscount(BigDecimal.ZERO);
        order.setFinalTotal(BigDecimal.ZERO);
        OrderEntity saved = orderRepository.save(order);
        OrderResponseDTO response = orderMapper.toDTO(saved);
        response.setItems(List.of());
        setRemainingAmount(response);
        return response;
    }

    @Override
    @Transactional
    public OrderResponseDTO update(Long branchId, Long orderId, OrderUpdateDTO dto) {
        authenticateUserBelongsInBranch(branchId);
        OrderEntity order = getEntity(orderId);
        UserEntity waiter = userRepository.findById(order.getWaiter().getId())
                .orElseThrow(()->new ResourceNotFoundException("user", order.getWaiter().getId()));
        if (dto.getTableNumber() != null) {
            TableEntity table = tableRepository.findByBranch_IdAndNumber(branchId, dto.getTableNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("There is no table number "+dto.getTableNumber()+" in this branch"));
            if (!table.isAvailable()) {
                throw new BusinessException("The table " + table.getNumber() + " is occupied");
            }
            //VERIFICAR QUE EN ESE MOMENTO LA MESA TENGA ASIGNADO A ESE WAITER
            if (table.getWaiter() == null || !table.getWaiter().getId().equals(waiter.getId()))
                throw new BusinessException(waiter.getFirstName() + " is not asigned to table " + table.getNumber());
            order.setTable(table);
        }
        OrderEntity updatedOrder = orderRepository.save(order);
        OrderResponseDTO response = orderMapper.toDTO(updatedOrder);
        setRemainingAmount(response);
        return response;
    }

    @Override
    @Transactional
    public void delete(Long orderId) {
        changeStatus(orderId, "CANCELLED");
    }

    // ------------------------------------------------------------- STATUS MANAGMENT --------------------------------------------------------

    @Override
    public List<OrderStatusDTO> getStatuses() {
        return orderStatusService.findAll();
    }

    @Override
    public OrderResponseDTO changeStatus(Long orderId, String newStatus) {
        OrderEntity order = getEntity(orderId);
        orderStatusService.changeOrderStatus(order, newStatus);
        OrderEntity updatedOrder = orderRepository.save(order);
        OrderResponseDTO response = orderMapper.toDTO(updatedOrder);
        setRemainingAmount(response);
        return response;
    }

    @Override
    public Boolean isCancelled(OrderEntity order) {
        return order.getStatus().getName().equalsIgnoreCase("CANCELLED");
    }

    @Override
    public Boolean isPaid(OrderEntity order) {
        return order.getStatus().getName().equalsIgnoreCase("PAID");
    }

    // ------------------------------------------------------------- PAYMENT MANAGMENT --------------------------------------------------------
    private void checkOrderCanReceivePayment(OrderEntity order) {
        if (!order.getStatus().getName().equalsIgnoreCase("SERVED")) {
            throw new BusinessException(
                    "Payments can only be added to orders that have been served. Current status: "
                            + order.getStatus().getName());
        }
    }

    private void checkIfOrderIsPaidOrCancelled(OrderEntity order) {
        if (isCancelled(order)) {
            throw new BusinessException("The order " + order.getId() + " is cancelled");
        }
        if (isPaid(order)) {
            throw new BusinessException("The order " + order.getId() + " is already paid");
        }
    }

    @Override
    @Transactional
    public PaymentDTO addPayment(Long branchId, Long orderId, PaymentDTO payment) {
        assertOrderInBranch(branchId, orderId);
        OrderEntity order = getEntity(orderId);
        checkOrderCanReceivePayment(order);
        return paymentService.addPayment(order, payment);
    }

    @Override
    @Transactional
    public OrderResponseDTO applyDiscount(Long branchId, Long orderId, DiscountRequestDTO discount) {
        assertOrderInBranch(branchId, orderId);
        OrderEntity order = getEntity(orderId);
        checkIfOrderIsPaidOrCancelled(order);
        OrderEntity saved = paymentService.applyDiscount(order, discount);
        OrderResponseDTO response = orderMapper.toDTO(saved);
        setRemainingAmount(response);
        setResponseItems(response);
        return response;
    }
    public OrderResponseDTO changeStatusInBranch(Long branchId, Long orderId, String newStatus) {
        assertOrderInBranch(branchId, orderId);
        return changeStatus(orderId, newStatus);
    }

    @Override
    @Transactional
    public void recalculateTotals(Long id) {
        OrderEntity order = getEntity(id);
        BigDecimal subtotal = getItems(id).stream()
                .map(detail -> detail.getUnitPrice().multiply(BigDecimal.valueOf(detail.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setSubtotal(subtotal);
        if (order.getDiscount().compareTo(subtotal) > 0) {
            order.setDiscount(subtotal);
        }
        order.setFinalTotal(subtotal.subtract(order.getDiscount()));
        orderRepository.save(order);
    }

    public void setRemainingAmount(OrderResponseDTO dto) {                             //metodo para calcular y asignar al responseDTO lo que falta pagar de la orden.
        BigDecimal totalPaid = paymentService.getTotalPaid(dto.getId());
        dto.setRemainingAmount(dto.getFinalTotal().subtract(totalPaid));
    }
    @Override
    public Boolean hasPaymentsOrDiscounts(Long orderId){
        OrderEntity order = getEntity(orderId);
        return (order.getDiscount().compareTo(BigDecimal.ZERO) != 0 || !paymentService.getPayments(orderId).isEmpty());
    }
}
