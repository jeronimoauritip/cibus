package com.jll.cibus.order.service;

import com.jll.cibus.auth.AuthService;
import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.common.exception.ForbiddenOperationException;
import com.jll.cibus.credential.repository.CredentialsRepository;
import com.jll.cibus.order.dto.OrderResponseDTO;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.order.entity.OrderStatusEntity;
import com.jll.cibus.order.mapper.OrderMapper;
import com.jll.cibus.order.repository.OrderRepository;
import com.jll.cibus.orderdetail.dto.OrderDetailResponseDTO;
import com.jll.cibus.orderdetail.entity.OrderDetailEntity;
import com.jll.cibus.orderdetail.mapper.OrderDetailMapper;
import com.jll.cibus.orderdetail.repository.OrderDetailRepository;
import com.jll.cibus.payment.dto.PaymentDTO;
import com.jll.cibus.payment.dto.TableBillDTO;
import com.jll.cibus.payment.dto.TableCheckoutRequestDTO;
import com.jll.cibus.payment.entity.PaymentMethodEntity;
import com.jll.cibus.payment.service.PaymentService;
import com.jll.cibus.role.entity.RoleEntity;
import com.jll.cibus.role.enums.Roles;
import com.jll.cibus.table.entity.TableEntity;
import com.jll.cibus.table.repository.TableRepository;
import com.jll.cibus.table.service.TableService;
import com.jll.cibus.user.entity.UserEntity;
import com.jll.cibus.user.repository.UserRepository;
import com.jll.cibus.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private OrderMapper orderMapper;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderDetailRepository orderDetailRepository;
    @Mock
    private OrderDetailMapper orderDetailMapper;
    @Mock
    private OrderStatusService orderStatusService;
    @Mock
    private UserService userService;
    @Mock
    private TableService tableService;
    @Mock
    private TableRepository tableRepository;
    @Mock
    private BranchRepository branchRepository;
    @Mock
    private PaymentService paymentService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CredentialsRepository credentialsRepository;
    @Mock
    private AuthService authService;

    @InjectMocks
    private OrderServiceImpl orderService;

    @Test
    void changeStatusInBranch_shouldAllowAssignedWaiterToMarkReadyOrderAsServedWithItems() {
        BranchEntity branch = BranchEntity.builder().id(2L).build();
        UserEntity waiter = UserEntity.builder()
                .id(7L)
                .role(new RoleEntity(Roles.WAITER))
                .build();
        TableEntity table = TableEntity.builder()
                .id(5L)
                .number(4)
                .branch(branch)
                .waiter(waiter)
                .build();
        OrderEntity order = OrderEntity.builder()
                .id(88L)
                .branch(branch)
                .table(table)
                .waiter(waiter)
                .finalTotal(BigDecimal.valueOf(1000))
                .build();

        OrderResponseDTO mappedDto = new OrderResponseDTO();
        mappedDto.setId(88L);
        mappedDto.setStatus("SERVED");
        mappedDto.setFinalTotal(BigDecimal.valueOf(1000));

        OrderDetailEntity detailEntity = new OrderDetailEntity();
        OrderDetailResponseDTO detailDto = new OrderDetailResponseDTO();

        when(branchRepository.existsById(2L)).thenReturn(true);
        when(orderRepository.findById(88L)).thenReturn(Optional.of(order));
        when(authService.getAuthenticatedUser()).thenReturn(waiter);
        when(orderRepository.save(order)).thenReturn(order);
        when(orderMapper.toDTO(order)).thenReturn(mappedDto);
        when(orderDetailRepository.findByOrderId(88L)).thenReturn(List.of(detailEntity));
        when(orderDetailMapper.toDTO(detailEntity)).thenReturn(detailDto);
        when(paymentService.getTotalPaid(88L)).thenReturn(BigDecimal.ZERO);

        OrderResponseDTO result = orderService.changeStatusInBranch(2L, 88L, "SERVED");

        verify(orderStatusService).changeOrderStatus(order, "SERVED");
        assertEquals("SERVED", result.getStatus());
        assertNotNull(result.getItems());
        assertEquals(1, result.getItems().size());
        assertEquals(BigDecimal.valueOf(1000), result.getRemainingAmount());
    }

    @Test
    void changeStatusInBranch_shouldRejectWaiterNotAssignedToTable() {
        BranchEntity branch = BranchEntity.builder().id(2L).build();
        UserEntity assignedWaiter = UserEntity.builder()
                .id(99L)
                .role(new RoleEntity(Roles.WAITER))
                .build();
        UserEntity otherWaiter = UserEntity.builder()
                .id(7L)
                .role(new RoleEntity(Roles.WAITER))
                .build();
        TableEntity table = TableEntity.builder()
                .id(5L)
                .number(4)
                .branch(branch)
                .waiter(assignedWaiter)
                .build();
        OrderEntity order = OrderEntity.builder()
                .id(88L)
                .branch(branch)
                .table(table)
                .waiter(assignedWaiter)
                .build();

        when(branchRepository.existsById(2L)).thenReturn(true);
        when(orderRepository.findById(88L)).thenReturn(Optional.of(order));
        when(authService.getAuthenticatedUser()).thenReturn(otherWaiter);

        assertThrows(
                ForbiddenOperationException.class,
                () -> orderService.changeStatusInBranch(2L, 88L, "SERVED")
        );
        verify(orderStatusService, never()).changeOrderStatus(any(), any());
    }

    @Test
    void getTableBill_shouldConsolidateAllActiveOrdersAndTotals() {
        BranchEntity branch = BranchEntity.builder().id(1L).name("Centro").build();
        UserEntity waiter = UserEntity.builder()
                .id(7L)
                .firstName("Carlos")
                .lastName("Gomez")
                .role(new RoleEntity(Roles.WAITER))
                .build();
        TableEntity table = TableEntity.builder()
                .id(5L)
                .number(4)
                .branch(branch)
                .waiter(waiter)
                .build();
        OrderStatusEntity servedStatus = OrderStatusEntity.builder().id(4L).name("SERVED").build();
        OrderEntity order1 = OrderEntity.builder()
                .id(10L)
                .branch(branch)
                .table(table)
                .waiter(waiter)
                .status(servedStatus)
                .createdAt(LocalDateTime.of(2026, 11, 14, 12, 0))
                .subtotal(new BigDecimal("1000.00"))
                .discount(BigDecimal.ZERO)
                .finalTotal(new BigDecimal("1000.00"))
                .build();
        OrderEntity order2 = OrderEntity.builder()
                .id(11L)
                .branch(branch)
                .table(table)
                .waiter(waiter)
                .status(servedStatus)
                .createdAt(LocalDateTime.of(2026, 11, 14, 12, 30))
                .subtotal(new BigDecimal("500.00"))
                .discount(new BigDecimal("50.00"))
                .finalTotal(new BigDecimal("450.00"))
                .build();

        OrderResponseDTO dto1 = new OrderResponseDTO();
        dto1.setId(10L);
        dto1.setStatus("SERVED");
        dto1.setSubtotal(new BigDecimal("1000.00"));
        dto1.setDiscount(BigDecimal.ZERO);
        dto1.setFinalTotal(new BigDecimal("1000.00"));

        OrderResponseDTO dto2 = new OrderResponseDTO();
        dto2.setId(11L);
        dto2.setStatus("SERVED");
        dto2.setSubtotal(new BigDecimal("500.00"));
        dto2.setDiscount(new BigDecimal("50.00"));
        dto2.setFinalTotal(new BigDecimal("450.00"));

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.findByBranch_IdAndNumberAndActiveTrue(1L, 4)).thenReturn(Optional.of(table));
        when(orderRepository.findActiveOrdersByTableId(5L)).thenReturn(List.of(order1, order2));
        when(orderMapper.toDTO(order1)).thenReturn(dto1);
        when(orderMapper.toDTO(order2)).thenReturn(dto2);
        when(orderDetailRepository.findByOrderId(10L)).thenReturn(List.of());
        when(orderDetailRepository.findByOrderId(11L)).thenReturn(List.of());
        when(paymentService.getTotalPaid(10L)).thenReturn(BigDecimal.ZERO);
        when(paymentService.getTotalPaid(11L)).thenReturn(BigDecimal.ZERO);
        when(paymentService.getPayments(10L)).thenReturn(List.of());
        when(paymentService.getPayments(11L)).thenReturn(List.of());

        TableBillDTO bill = orderService.getTableBill(1L, 4);

        assertTrue(bill.getAllServed());
        assertEquals(2, bill.getOrders().size());
        assertEquals(new BigDecimal("1500.00"), bill.getSubtotal());
        assertEquals(new BigDecimal("50.00"), bill.getDiscount());
        assertEquals(new BigDecimal("1450.00"), bill.getFinalTotal());
        assertEquals(new BigDecimal("1450.00"), bill.getRemainingAmount());
    }

    @Test
    void checkoutTable_shouldDistributeDiscountAndSplitPaymentsAndMarkAllOrdersPaid() {
        BranchEntity branch = BranchEntity.builder().id(1L).name("Centro").build();
        UserEntity waiter = UserEntity.builder()
                .id(7L)
                .firstName("Carlos")
                .lastName("Gomez")
                .role(new RoleEntity(Roles.WAITER))
                .build();
        TableEntity table = TableEntity.builder()
                .id(5L)
                .number(4)
                .branch(branch)
                .waiter(waiter)
                .build();
        OrderStatusEntity servedStatus = OrderStatusEntity.builder().id(4L).name("SERVED").build();
        OrderEntity order1 = OrderEntity.builder()
                .id(10L)
                .branch(branch)
                .table(table)
                .waiter(waiter)
                .status(servedStatus)
                .createdAt(LocalDateTime.of(2026, 11, 14, 12, 0))
                .subtotal(new BigDecimal("1000.00"))
                .discount(BigDecimal.ZERO)
                .finalTotal(new BigDecimal("1000.00"))
                .build();
        OrderEntity order2 = OrderEntity.builder()
                .id(11L)
                .branch(branch)
                .table(table)
                .waiter(waiter)
                .status(servedStatus)
                .createdAt(LocalDateTime.of(2026, 11, 14, 12, 30))
                .subtotal(new BigDecimal("500.00"))
                .discount(BigDecimal.ZERO)
                .finalTotal(new BigDecimal("500.00"))
                .build();

        PaymentMethodEntity cash = PaymentMethodEntity.builder().id(1L).name("EFECTIVO").build();
        PaymentMethodEntity card = PaymentMethodEntity.builder().id(2L).name("CREDITO").build();

        OrderResponseDTO paidDto1 = new OrderResponseDTO();
        paidDto1.setId(10L);
        paidDto1.setStatus("PAID");
        OrderResponseDTO paidDto2 = new OrderResponseDTO();
        paidDto2.setId(11L);
        paidDto2.setStatus("PAID");

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.findByBranch_IdAndNumberAndActiveTrue(1L, 4)).thenReturn(Optional.of(table));
        when(orderRepository.findActiveOrdersByTableId(5L)).thenReturn(List.of(order1, order2));
        when(authService.getAuthenticatedUser()).thenReturn(waiter);
        when(paymentService.getTotalPaid(10L)).thenReturn(BigDecimal.ZERO);
        when(paymentService.getTotalPaid(11L)).thenReturn(BigDecimal.ZERO);
        when(paymentService.getPaymentMethod(1L)).thenReturn(cash);
        when(paymentService.getPaymentMethod(2L)).thenReturn(card);
        when(orderRepository.save(order1)).thenReturn(order1);
        when(orderRepository.save(order2)).thenReturn(order2);
        when(orderMapper.toDTO(order1)).thenReturn(paidDto1);
        when(orderMapper.toDTO(order2)).thenReturn(paidDto2);
        when(orderDetailRepository.findByOrderId(10L)).thenReturn(List.of());
        when(orderDetailRepository.findByOrderId(11L)).thenReturn(List.of());

        TableCheckoutRequestDTO request = TableCheckoutRequestDTO.builder()
                .orderIds(List.of(10L, 11L))
                .discount(new BigDecimal("150.00"))
                .payments(List.of(
                        new PaymentDTO(1L, new BigDecimal("700.00")),
                        new PaymentDTO(2L, new BigDecimal("650.00"))
                ))
                .build();

        TableBillDTO result = orderService.checkoutTable(1L, 4, request);

        assertEquals(new BigDecimal("100.00"), order1.getDiscount());
        assertEquals(new BigDecimal("900.00"), order1.getFinalTotal());
        assertEquals(new BigDecimal("50.00"), order2.getDiscount());
        assertEquals(new BigDecimal("450.00"), order2.getFinalTotal());

        // Order 1 (900) receives 700 cash + 200 card; Order 2 (450) receives 450 card
        verify(paymentService).registerPaymentSlice(order1, cash, new BigDecimal("700.00"));
        verify(paymentService).registerPaymentSlice(order1, card, new BigDecimal("200.00"));
        verify(paymentService).registerPaymentSlice(order2, card, new BigDecimal("450.00"));

        verify(orderStatusService).changeOrderStatus(order1, "PAID");
        verify(orderStatusService).changeOrderStatus(order2, "PAID");
        assertNotNull(order1.getClosedAt());
        assertNotNull(order2.getClosedAt());
        assertEquals(new BigDecimal("1350.00"), result.getFinalTotal());
        assertEquals(BigDecimal.ZERO, result.getRemainingAmount());
    }

    @Test
    void checkoutTable_shouldRejectWhenAnyOrderIsNotServed() {
        BranchEntity branch = BranchEntity.builder().id(1L).build();
        UserEntity waiter = UserEntity.builder().id(7L).role(new RoleEntity(Roles.WAITER)).build();
        TableEntity table = TableEntity.builder().id(5L).number(4).branch(branch).waiter(waiter).build();
        OrderEntity order1 = OrderEntity.builder()
                .id(10L)
                .status(OrderStatusEntity.builder().name("SERVED").build())
                .finalTotal(new BigDecimal("1000.00"))
                .build();
        OrderEntity order2 = OrderEntity.builder()
                .id(11L)
                .status(OrderStatusEntity.builder().name("READY").build())
                .finalTotal(new BigDecimal("500.00"))
                .build();

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.findByBranch_IdAndNumberAndActiveTrue(1L, 4)).thenReturn(Optional.of(table));
        when(orderRepository.findActiveOrdersByTableId(5L)).thenReturn(List.of(order1, order2));
        when(authService.getAuthenticatedUser()).thenReturn(waiter);

        TableCheckoutRequestDTO request = TableCheckoutRequestDTO.builder()
                .orderIds(List.of(10L, 11L))
                .payments(List.of(new PaymentDTO(1L, new BigDecimal("1500.00"))))
                .build();

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.checkoutTable(1L, 4, request));
        assertTrue(ex.getMessage().contains("All orders must be served"));
        verify(paymentService, never()).registerPaymentSlice(any(), any(), any());
    }

    @Test
    void checkoutTable_shouldRejectWhenOrderIdsDoNotMatchActiveOrders() {
        BranchEntity branch = BranchEntity.builder().id(1L).build();
        UserEntity waiter = UserEntity.builder().id(7L).role(new RoleEntity(Roles.WAITER)).build();
        TableEntity table = TableEntity.builder().id(5L).number(4).branch(branch).waiter(waiter).build();
        OrderEntity order1 = OrderEntity.builder()
                .id(10L)
                .status(OrderStatusEntity.builder().name("SERVED").build())
                .finalTotal(new BigDecimal("1000.00"))
                .build();
        OrderEntity order2 = OrderEntity.builder()
                .id(11L)
                .status(OrderStatusEntity.builder().name("SERVED").build())
                .finalTotal(new BigDecimal("500.00"))
                .build();

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.findByBranch_IdAndNumberAndActiveTrue(1L, 4)).thenReturn(Optional.of(table));
        when(orderRepository.findActiveOrdersByTableId(5L)).thenReturn(List.of(order1, order2));
        when(authService.getAuthenticatedUser()).thenReturn(waiter);

        TableCheckoutRequestDTO request = TableCheckoutRequestDTO.builder()
                .orderIds(List.of(10L))
                .payments(List.of(new PaymentDTO(1L, new BigDecimal("1500.00"))))
                .build();

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.checkoutTable(1L, 4, request));
        assertTrue(ex.getMessage().contains("have changed"));
    }

    @Test
    void checkoutTable_shouldRejectWhenPaymentSumDoesNotEqualNetDue() {
        BranchEntity branch = BranchEntity.builder().id(1L).build();
        UserEntity waiter = UserEntity.builder().id(7L).role(new RoleEntity(Roles.WAITER)).build();
        TableEntity table = TableEntity.builder().id(5L).number(4).branch(branch).waiter(waiter).build();
        OrderEntity order1 = OrderEntity.builder()
                .id(10L)
                .status(OrderStatusEntity.builder().name("SERVED").build())
                .finalTotal(new BigDecimal("1000.00"))
                .build();
        PaymentMethodEntity cash = PaymentMethodEntity.builder().id(1L).name("EFECTIVO").build();

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.findByBranch_IdAndNumberAndActiveTrue(1L, 4)).thenReturn(Optional.of(table));
        when(orderRepository.findActiveOrdersByTableId(5L)).thenReturn(List.of(order1));
        when(authService.getAuthenticatedUser()).thenReturn(waiter);
        when(paymentService.getTotalPaid(10L)).thenReturn(BigDecimal.ZERO);
        when(paymentService.getPaymentMethod(1L)).thenReturn(cash);

        TableCheckoutRequestDTO request = TableCheckoutRequestDTO.builder()
                .orderIds(List.of(10L))
                .discount(new BigDecimal("100.00"))
                .payments(List.of(new PaymentDTO(1L, new BigDecimal("800.00"))))
                .build();

        BusinessException ex = assertThrows(BusinessException.class,
                () -> orderService.checkoutTable(1L, 4, request));
        assertTrue(ex.getMessage().contains("must equal the remaining balance"));
        verify(paymentService, never()).registerPaymentSlice(any(), any(), any());
    }

    @Test
    void checkoutTable_shouldRejectWaiterNotAssignedToTable() {
        BranchEntity branch = BranchEntity.builder().id(1L).build();
        UserEntity assignedWaiter = UserEntity.builder().id(99L).role(new RoleEntity(Roles.WAITER)).build();
        UserEntity otherWaiter = UserEntity.builder().id(7L).role(new RoleEntity(Roles.WAITER)).build();
        TableEntity table = TableEntity.builder().id(5L).number(4).branch(branch).waiter(assignedWaiter).build();
        OrderEntity order1 = OrderEntity.builder()
                .id(10L)
                .status(OrderStatusEntity.builder().name("SERVED").build())
                .finalTotal(new BigDecimal("1000.00"))
                .build();

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.findByBranch_IdAndNumberAndActiveTrue(1L, 4)).thenReturn(Optional.of(table));
        when(orderRepository.findActiveOrdersByTableId(5L)).thenReturn(List.of(order1));
        when(authService.getAuthenticatedUser()).thenReturn(otherWaiter);

        TableCheckoutRequestDTO request = TableCheckoutRequestDTO.builder()
                .orderIds(List.of(10L))
                .payments(List.of(new PaymentDTO(1L, new BigDecimal("1000.00"))))
                .build();

        assertThrows(ForbiddenOperationException.class,
                () -> orderService.checkoutTable(1L, 4, request));
        verify(paymentService, never()).registerPaymentSlice(any(), any(), any());
    }
}

