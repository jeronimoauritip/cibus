package com.jll.cibus.table.service;

import com.jll.cibus.auth.AuthService;
import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.credential.repository.CredentialsRepository;
import com.jll.cibus.order.repository.OrderRepository;
import com.jll.cibus.table.dto.TableCreateDTO;
import com.jll.cibus.table.dto.TableResponseDTO;
import com.jll.cibus.table.entity.TableEntity;
import com.jll.cibus.table.mapper.TableMapper;
import com.jll.cibus.table.repository.TableRepository;
import com.jll.cibus.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TableServiceImplTest {

    @Mock
    private TableRepository tableRepository;
    @Mock
    private TableMapper tableMapper;
    @Mock
    private BranchRepository branchRepository;
    @Mock
    private CredentialsRepository credentialsRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private AuthService authService;

    @InjectMocks
    private TableServiceImpl tableService;

    @Test
    void delete_shouldSoftDeleteFreeTableWithNoActiveOrders() {
        BranchEntity branch = BranchEntity.builder().id(1L).build();
        TableEntity table = TableEntity.builder()
                .id(10L)
                .branch(branch)
                .number(4)
                .capacity(4)
                .available(true)
                .active(true)
                .build();

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.findByBranch_IdAndNumberAndActiveTrue(1L, 4)).thenReturn(Optional.of(table));
        when(orderRepository.tableHasOrdersActive(10L)).thenReturn(false);

        tableService.delete(1L, 4);

        assertFalse(table.getActive());
        assertTrue(table.getAvailable());
        assertNull(table.getWaiter());
        verify(tableRepository).save(table);
        verify(tableRepository, never()).delete(any());
    }

    @Test
    void delete_shouldRejectOccupiedTable() {
        TableEntity table = TableEntity.builder()
                .id(10L)
                .number(4)
                .available(false)
                .active(true)
                .build();

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.findByBranch_IdAndNumberAndActiveTrue(1L, 4)).thenReturn(Optional.of(table));

        BusinessException ex = assertThrows(BusinessException.class, () -> tableService.delete(1L, 4));
        assertTrue(ex.getMessage().contains("occupied"));
        verify(tableRepository, never()).save(any());
    }

    @Test
    void delete_shouldRejectTableWithActiveOrders() {
        TableEntity table = TableEntity.builder()
                .id(10L)
                .number(4)
                .available(true)
                .active(true)
                .build();

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.findByBranch_IdAndNumberAndActiveTrue(1L, 4)).thenReturn(Optional.of(table));
        when(orderRepository.tableHasOrdersActive(10L)).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class, () -> tableService.delete(1L, 4));
        assertTrue(ex.getMessage().contains("active orders"));
        verify(tableRepository, never()).save(any());
    }

    @Test
    void create_shouldReactivateSoftDeletedTableWithSameNumber() {
        BranchEntity branch = BranchEntity.builder().id(1L).build();
        TableEntity inactiveTable = TableEntity.builder()
                .id(10L)
                .branch(branch)
                .number(4)
                .capacity(2)
                .posX(40)
                .posY(40)
                .shape("ROUND")
                .available(false)
                .active(false)
                .build();

        TableCreateDTO dto = new TableCreateDTO();
        dto.setNumber(4);
        dto.setCapacity(6);
        dto.setPosX(180);
        dto.setPosY(220);
        dto.setShape("rect");

        TableResponseDTO expectedDto = new TableResponseDTO();
        expectedDto.setId(10L);
        expectedDto.setNumber(4);
        expectedDto.setCapacity(6);

        when(branchRepository.existsById(1L)).thenReturn(true);
        when(tableRepository.existsByBranchIdAndNumber(1L, 4)).thenReturn(false);
        when(tableRepository.findByBranch_IdAndNumber(1L, 4)).thenReturn(Optional.of(inactiveTable));
        when(tableRepository.save(inactiveTable)).thenReturn(inactiveTable);
        when(tableMapper.toDTO(inactiveTable)).thenReturn(expectedDto);

        TableResponseDTO result = tableService.create(dto, 1L);

        assertTrue(inactiveTable.getActive());
        assertTrue(inactiveTable.getAvailable());
        assertNull(inactiveTable.getWaiter());
        assertEquals(6, inactiveTable.getCapacity());
        assertEquals(180, inactiveTable.getPosX());
        assertEquals(220, inactiveTable.getPosY());
        assertEquals("RECT", inactiveTable.getShape());
        assertEquals(10L, result.getId());
    }
}

