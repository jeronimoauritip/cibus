package com.jll.cibus.table.service;

import com.jll.cibus.table.dto.TableCreateDTO;
import com.jll.cibus.table.dto.TableResponseDTO;
import com.jll.cibus.table.dto.TableUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TableService {
    Page<TableResponseDTO> findAll(Pageable pageable, Long branchId, Integer tableNumber, Integer capacity, Boolean available, Long waiterId);
    TableResponseDTO findByNumber(Long branchId, Integer tableNumber);
    Boolean existsByBranchIdAndNumber(Long branchId, Integer tableNumber);
    TableResponseDTO create(TableCreateDTO dto, Long branchId);
    TableResponseDTO occupy(Long branchId, Integer tableNumber, Long waiterId);
    TableResponseDTO free(Long branchId, Integer tableNumber);
    TableResponseDTO update(Long branchId, Integer tableNumber, TableUpdateDTO newTable);
    void delete(Long branchId, Integer tableNumber);
}