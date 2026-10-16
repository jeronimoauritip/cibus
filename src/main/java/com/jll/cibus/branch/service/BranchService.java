package com.jll.cibus.branch.service;

import com.jll.cibus.branch.dto.BranchRequestDTO;
import com.jll.cibus.branch.dto.BranchResponseDTO;

import java.util.List;

public interface BranchService {
    List<BranchResponseDTO> getAllBranches();
    BranchResponseDTO getBranchById(Long id);
    BranchResponseDTO getBranchByAddress(String street, Integer number);
    Boolean existsByName(String name);
    Boolean existsById(Long id);
    BranchResponseDTO create(BranchRequestDTO requestDTO);
    BranchResponseDTO update(Long id, BranchRequestDTO dto);
    void delete(Long id);
}