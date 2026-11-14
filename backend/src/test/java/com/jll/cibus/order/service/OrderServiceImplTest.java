package com.jll.cibus.order.service;

import com.jll.cibus.auth.AuthService;
import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.common.exception.ForbiddenOperationException;
import com.jll.cibus.credential.repository.CredentialsRepository;
import com.jll.cibus.order.dto.OrderResponseDTO;
import com.jll.cibus.order.entity.OrderEntity;
import com.jll.cibus.order.mapper.OrderMapper;
import com.jll.cibus.order.repository.OrderRepository;
import com.jll.cibus.orderdetail.dto.OrderDetailResponseDTO;
import com.jll.cibus.orderdetail.entity.OrderDetailEntity;
import com.jll.cibus.orderdetail.mapper.OrderDetailMapper;
import com.jll.cibus.orderdetail.repository.OrderDetailRepository;
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
}

