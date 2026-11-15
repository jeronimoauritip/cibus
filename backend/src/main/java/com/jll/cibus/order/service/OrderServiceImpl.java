package com.jll.cibus.order.service;

import com.jll.cibus.auth.AuthService;
import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.common.exception.ForbiddenOperationException;
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
import com.jll.cibus.payment.dto.TableBillDTO;
import com.jll.cibus.payment.dto.TableCheckoutRequestDTO;
import com.jll.cibus.payment.entity.OrderPaymentEntity;
import com.jll.cibus.payment.entity.PaymentMethodEntity;
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
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

        Roles role = waiterCredentials.getUser() != null && waiterCredentials.getUser().getRole() != null
                ? waiterCredentials.getUser().getRole().getRole()
                : null;
        boolean canServeTable = role == Roles.WAITER
                || role == Roles.HOST
                || role == Roles.MANAGER
                || role == Roles.ADMIN;

        if (!canServeTable)
            throw new BusinessException("The user with id " + dto.getWaiterId() + " cannot serve tables");

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
        TableEntity table = tableRepository.findByBranch_IdAndNumberAndActiveTrue(branchId, dto.getTableNumber())
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
            TableEntity table = tableRepository.findByBranch_IdAndNumberAndActiveTrue(branchId, dto.getTableNumber())
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
    @Transactional
    public OrderResponseDTO changeStatus(Long orderId, String newStatus) {
        OrderEntity order = getEntity(orderId);
        orderStatusService.changeOrderStatus(order, newStatus);
        OrderEntity updatedOrder = orderRepository.save(order);
        OrderResponseDTO response = orderMapper.toDTO(updatedOrder);
        setResponseItems(response);
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
    @Deprecated
    @Transactional
    public PaymentDTO addPayment(Long branchId, Long orderId, PaymentDTO payment) {
        assertOrderInBranch(branchId, orderId);
        OrderEntity order = getEntity(orderId);
        checkOrderCanReceivePayment(order);
        return paymentService.addPayment(order, payment);
    }

    @Override
    @Deprecated
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

    @Override
    public TableBillDTO getTableBill(Long branchId, Integer tableNumber) {
        authenticateUserBelongsInBranch(branchId);
        TableEntity table = tableRepository.findByBranch_IdAndNumberAndActiveTrue(branchId, tableNumber)
                .orElseThrow(() -> new ResourceNotFoundException("table number", tableNumber));
        List<OrderEntity> activeOrders = orderRepository.findActiveOrdersByTableId(table.getId());
        if (activeOrders.isEmpty()) {
            throw new BusinessException("Table " + tableNumber + " has no active orders to bill");
        }

        List<OrderResponseDTO> orderDtos = new ArrayList<>(activeOrders.size());
        List<PaymentDTO> existingPayments = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal finalTotal = BigDecimal.ZERO;
        BigDecimal remainingAmount = BigDecimal.ZERO;

        for (OrderEntity order : activeOrders) {
            OrderResponseDTO dto = orderMapper.toDTO(order);
            setResponseItems(dto);
            setRemainingAmount(dto);
            orderDtos.add(dto);

            subtotal = subtotal.add(dto.getSubtotal() != null ? dto.getSubtotal() : BigDecimal.ZERO);
            discount = discount.add(dto.getDiscount() != null ? dto.getDiscount() : BigDecimal.ZERO);
            finalTotal = finalTotal.add(dto.getFinalTotal() != null ? dto.getFinalTotal() : BigDecimal.ZERO);
            remainingAmount = remainingAmount.add(dto.getRemainingAmount() != null ? dto.getRemainingAmount() : BigDecimal.ZERO);

            List<OrderPaymentEntity> orderPayments = paymentService.getPayments(order.getId());
            if (orderPayments != null) {
                for (OrderPaymentEntity p : orderPayments) {
                    existingPayments.add(PaymentDTO.builder()
                            .paymentMethodId(p.getPaymentMethod().getId())
                            .amount(p.getAmount())
                            .build());
                }
            }
        }

        boolean allServed = activeOrders.stream()
                .allMatch(o -> o.getStatus() != null && "SERVED".equalsIgnoreCase(o.getStatus().getName()));

        return buildTableBillDTO(branchId, table, activeOrders, orderDtos, existingPayments,
                subtotal, discount, finalTotal, finalTotal.subtract(remainingAmount), remainingAmount,
                allServed, null);
    }

    @Override
    @Transactional
    public TableBillDTO checkoutTable(Long branchId, Integer tableNumber, TableCheckoutRequestDTO request) {
        authenticateUserBelongsInBranch(branchId);
        TableEntity table = tableRepository.findByBranch_IdAndNumberAndActiveTrue(branchId, tableNumber)
                .orElseThrow(() -> new ResourceNotFoundException("table number", tableNumber));

        List<OrderEntity> activeOrders = orderRepository.findActiveOrdersByTableId(table.getId());
        if (activeOrders.isEmpty()) {
            throw new BusinessException("Table " + tableNumber + " has no active orders to close");
        }

        UserEntity authenticatedUser = authService.getAuthenticatedUser();
        if (authenticatedUser.getRole().getRole() == Roles.WAITER) {
            Long assignedWaiterId = table.getWaiter() != null
                    ? table.getWaiter().getId()
                    : (activeOrders.get(0).getWaiter() != null ? activeOrders.get(0).getWaiter().getId() : null);
            if (assignedWaiterId == null || !assignedWaiterId.equals(authenticatedUser.getId())) {
                throw new ForbiddenOperationException("Waiters can only perform actions on tables assigned to themselves");
            }
        }

        if (request.getOrderIds() != null && !request.getOrderIds().isEmpty()) {
            Set<Long> activeIds = activeOrders.stream().map(OrderEntity::getId).collect(Collectors.toSet());
            Set<Long> requestedIds = new HashSet<>(request.getOrderIds());
            if (requestedIds.size() != activeOrders.size() || !activeIds.equals(requestedIds)) {
                throw new BusinessException("Active orders for table " + tableNumber + " have changed. Please reload the bill.");
            }
        }

        for (OrderEntity order : activeOrders) {
            if (order.getStatus() == null || !"SERVED".equalsIgnoreCase(order.getStatus().getName())) {
                String currentStatus = order.getStatus() != null ? order.getStatus().getName() : "UNKNOWN";
                throw new BusinessException("All orders must be served before charging and closing the table. Current status of order #"
                        + order.getId() + ": " + currentStatus);
            }
        }

        List<BigDecimal> orderRemaining = new ArrayList<>(activeOrders.size());
        BigDecimal totalRemaining = BigDecimal.ZERO;
        for (OrderEntity order : activeOrders) {
            BigDecimal paid = paymentService.getTotalPaid(order.getId());
            BigDecimal rem = order.getFinalTotal().subtract(paid).setScale(2, RoundingMode.HALF_UP);
            orderRemaining.add(rem);
            totalRemaining = totalRemaining.add(rem);
        }
        totalRemaining = totalRemaining.setScale(2, RoundingMode.HALF_UP);
        if (totalRemaining.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Table " + tableNumber + " has no remaining balance to pay");
        }

        BigDecimal discount = request.getDiscount() != null
                ? request.getDiscount().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Discount cannot be negative");
        }
        if (discount.compareTo(totalRemaining) >= 0) {
            throw new BusinessException("Discount cannot exceed or equal the remaining balance");
        }

        BigDecimal netDue = totalRemaining.subtract(discount).setScale(2, RoundingMode.HALF_UP);

        if (request.getPayments() == null || request.getPayments().isEmpty()) {
            throw new BusinessException("At least one payment is required to close the table");
        }

        List<PaymentMethodEntity> resolvedMethods = new ArrayList<>(request.getPayments().size());
        List<BigDecimal> paymentLineAmounts = new ArrayList<>(request.getPayments().size());
        List<PaymentDTO> normalizedPayments = new ArrayList<>(request.getPayments().size());
        BigDecimal totalPaymentAmount = BigDecimal.ZERO;

        for (PaymentDTO p : request.getPayments()) {
            if (p.getAmount() == null || p.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Amount must be greater than zero");
            }
            BigDecimal normalizedAmount = p.getAmount().setScale(2, RoundingMode.HALF_UP);
            PaymentMethodEntity method = paymentService.getPaymentMethod(p.getPaymentMethodId());
            resolvedMethods.add(method);
            paymentLineAmounts.add(normalizedAmount);
            normalizedPayments.add(PaymentDTO.builder()
                    .paymentMethodId(method.getId() != null ? method.getId() : p.getPaymentMethodId())
                    .amount(normalizedAmount)
                    .build());
            totalPaymentAmount = totalPaymentAmount.add(normalizedAmount);
        }

        if (totalPaymentAmount.compareTo(netDue) != 0) {
            throw new BusinessException("Total payment amount must equal the remaining balance to pay (" + netDue + ")");
        }

        if (discount.compareTo(BigDecimal.ZERO) > 0) {
            distributeDiscountAcrossOrders(activeOrders, orderRemaining, totalRemaining, discount);
        }

        distributePaymentsAcrossOrders(activeOrders, orderRemaining, resolvedMethods, paymentLineAmounts);

        LocalDateTime closedAt = LocalDateTime.now();
        List<OrderResponseDTO> orderDtos = new ArrayList<>(activeOrders.size());
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalDiscount = BigDecimal.ZERO;
        BigDecimal finalTotal = BigDecimal.ZERO;

        for (OrderEntity order : activeOrders) {
            orderStatusService.changeOrderStatus(order, "PAID");
            order.setClosedAt(closedAt);
            OrderEntity saved = orderRepository.save(order);
            OrderResponseDTO dto = orderMapper.toDTO(saved);
            setResponseItems(dto);
            dto.setRemainingAmount(BigDecimal.ZERO);
            orderDtos.add(dto);

            subtotal = subtotal.add(saved.getSubtotal() != null ? saved.getSubtotal() : BigDecimal.ZERO);
            totalDiscount = totalDiscount.add(saved.getDiscount() != null ? saved.getDiscount() : BigDecimal.ZERO);
            finalTotal = finalTotal.add(saved.getFinalTotal() != null ? saved.getFinalTotal() : BigDecimal.ZERO);
        }

        return buildTableBillDTO(branchId, table, activeOrders, orderDtos, normalizedPayments,
                subtotal, totalDiscount, finalTotal, finalTotal, BigDecimal.ZERO,
                true, closedAt);
    }

    private void distributeDiscountAcrossOrders(List<OrderEntity> orders,
                                                List<BigDecimal> orderRemaining,
                                                BigDecimal totalRemaining,
                                                BigDecimal discount) {
        int lastPositiveIdx = -1;
        for (int i = 0; i < orders.size(); i++) {
            if (orderRemaining.get(i).compareTo(BigDecimal.ZERO) > 0) {
                lastPositiveIdx = i;
            }
        }

        BigDecimal[] shares = new BigDecimal[orders.size()];
        Arrays.fill(shares, BigDecimal.ZERO);
        BigDecimal remainingDiscount = discount;

        for (int i = 0; i < orders.size() && remainingDiscount.compareTo(BigDecimal.ZERO) > 0; i++) {
            BigDecimal rem = orderRemaining.get(i);
            if (rem.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            BigDecimal share;
            if (i == lastPositiveIdx) {
                share = rem.min(remainingDiscount);
            } else {
                share = discount.multiply(rem).divide(totalRemaining, 2, RoundingMode.HALF_UP)
                        .min(rem)
                        .min(remainingDiscount);
            }
            shares[i] = share;
            remainingDiscount = remainingDiscount.subtract(share);
        }

        for (int i = 0; i < orders.size() && remainingDiscount.compareTo(BigDecimal.ZERO) > 0; i++) {
            BigDecimal capacity = orderRemaining.get(i).subtract(shares[i]);
            if (capacity.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal extra = capacity.min(remainingDiscount);
                shares[i] = shares[i].add(extra);
                remainingDiscount = remainingDiscount.subtract(extra);
            }
        }

        for (int i = 0; i < orders.size(); i++) {
            BigDecimal share = shares[i];
            if (share.compareTo(BigDecimal.ZERO) > 0) {
                OrderEntity order = orders.get(i);
                BigDecimal currentDiscount = order.getDiscount() != null ? order.getDiscount() : BigDecimal.ZERO;
                order.setDiscount(currentDiscount.add(share));
                order.setFinalTotal(order.getFinalTotal().subtract(share));
                orderRemaining.set(i, orderRemaining.get(i).subtract(share));
            }
        }
    }

    private void distributePaymentsAcrossOrders(List<OrderEntity> orders,
                                                List<BigDecimal> orderRemaining,
                                                List<PaymentMethodEntity> methods,
                                                List<BigDecimal> lineAmounts) {
        int lineIdx = 0;
        BigDecimal lineRemaining = lineAmounts.get(0);

        for (int i = 0; i < orders.size(); i++) {
            OrderEntity order = orders.get(i);
            BigDecimal rem = orderRemaining.get(i);
            while (rem.compareTo(BigDecimal.ZERO) > 0) {
                while (lineRemaining.compareTo(BigDecimal.ZERO) <= 0) {
                    lineIdx++;
                    lineRemaining = lineAmounts.get(lineIdx);
                }
                BigDecimal slice = rem.min(lineRemaining);
                paymentService.registerPaymentSlice(order, methods.get(lineIdx), slice);
                rem = rem.subtract(slice);
                lineRemaining = lineRemaining.subtract(slice);
            }
            orderRemaining.set(i, BigDecimal.ZERO);
        }
    }

    private TableBillDTO buildTableBillDTO(Long branchId,
                                         TableEntity table,
                                         List<OrderEntity> activeOrders,
                                         List<OrderResponseDTO> orderDtos,
                                         List<PaymentDTO> payments,
                                         BigDecimal subtotal,
                                         BigDecimal discount,
                                         BigDecimal finalTotal,
                                         BigDecimal totalPaid,
                                         BigDecimal remainingAmount,
                                         boolean allServed,
                                         LocalDateTime closedAt) {
        OrderEntity firstOrder = activeOrders.get(0);
        UserEntity waiter = table.getWaiter() != null ? table.getWaiter() : firstOrder.getWaiter();
        String branchName = table.getBranch() != null
                ? table.getBranch().getName()
                : (firstOrder.getBranch() != null ? firstOrder.getBranch().getName() : null);
        LocalDateTime openedAt = activeOrders.stream()
                .map(OrderEntity::getCreatedAt)
                .filter(Objects::nonNull)
                .min(LocalDateTime::compareTo)
                .orElse(null);

        return TableBillDTO.builder()
                .branchId(branchId)
                .branchName(branchName)
                .tableNumber(table.getNumber())
                .waiterId(waiter != null ? waiter.getId() : null)
                .waiterFirstName(waiter != null ? waiter.getFirstName() : null)
                .waiterLastName(waiter != null ? waiter.getLastName() : null)
                .openedAt(openedAt)
                .closedAt(closedAt)
                .allServed(allServed)
                .subtotal(subtotal)
                .discount(discount)
                .finalTotal(finalTotal)
                .totalPaid(totalPaid)
                .remainingAmount(remainingAmount)
                .orders(orderDtos)
                .payments(payments)
                .build();
    }
    @Override
    @Transactional
    public OrderResponseDTO changeStatusInBranch(Long branchId, Long orderId, String newStatus) {
        assertOrderInBranch(branchId, orderId);
        OrderEntity order = getEntity(orderId);
        UserEntity authenticatedUser = authService.getAuthenticatedUser();
        if (authenticatedUser.getRole().getRole() == Roles.WAITER) {
            Long assignedWaiterId = order.getTable() != null && order.getTable().getWaiter() != null
                    ? order.getTable().getWaiter().getId()
                    : (order.getWaiter() != null ? order.getWaiter().getId() : null);
            if (assignedWaiterId == null || !assignedWaiterId.equals(authenticatedUser.getId())) {
                throw new ForbiddenOperationException("Waiters can only perform actions on tables assigned to themselves");
            }
        }
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
