package com.jll.cibus.branch.service;

import com.jll.cibus.branch.dto.BranchRequestDTO;
import com.jll.cibus.branch.dto.BranchResponseDTO;
import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.branch.mapper.BranchMapper;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.common.exception.ResourceAlreadyExistsException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.table.repository.TableRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService{

    private final BranchRepository branchRepository;
    private final TableRepository tableRepository;
    private final BranchMapper branchMapper;

    @Override
    public List<BranchResponseDTO> getAllBranches() {
        return branchRepository.findAll()
                .stream()
                .map(branchMapper::toDTO)
                .toList();
    }

    private BranchEntity getEntity(Long id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("branch", id));
    }

    @Override
    public BranchResponseDTO getBranchById(Long id) {
        BranchEntity entity = getEntity(id);
        return branchMapper.toDTO(entity);
    }

    private BranchEntity getEntityByAddress(String street, Integer number) {
        return branchRepository.findByStreetAndNumber(street, number)
                .orElseThrow(() -> new ResourceNotFoundException("Branch Address", street + " " + number));
    }

    @Override
    public BranchResponseDTO getBranchByAddress(String street, Integer number) {
        BranchEntity entity = getEntityByAddress(street, number);
        return branchMapper.toDTO(entity);
    }

    @Override
    public Boolean existsByName(String name) {
        return branchRepository.existsByName(name);
    }

    @Override
    public Boolean existsById(Long id){
        return branchRepository.existsById(id);
    }

    private void addressVerification(String street, Integer number) {
        if (branchRepository.existsByStreetAndNumber(street, number)) {
            throw new ResourceAlreadyExistsException("FAILED TO REGISTER: theres another branch in " + street + " " + number);
        }
    }

    @Override
    @Transactional
    public BranchResponseDTO create(BranchRequestDTO requestDTO) {
        if(existsByName(requestDTO.getName())){
            throw new ResourceAlreadyExistsException("FAILED TO REGISTER: theres another branch with the name " + requestDTO.getName());
        }
        addressVerification(requestDTO.getStreet(), requestDTO.getNumber());

        BranchEntity entity = branchMapper.toEntity(requestDTO);
        BranchEntity saved = branchRepository.save(entity);

        return branchMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public BranchResponseDTO update(Long id, BranchRequestDTO dto) {
        BranchEntity branchBase = getEntity(id);
        if (!branchBase.getName().equalsIgnoreCase(dto.getName())) {
            if (existsByName(dto.getName())) throw new ResourceAlreadyExistsException("FAILED TO REGISTER: there is another branch with the name: "+ dto.getName());
            branchBase.setName(dto.getName());
        }
        if (!branchBase.getStreet().equals(dto.getStreet()) || !branchBase.getNumber().equals(dto.getNumber())) {
            addressVerification(dto.getStreet(), dto.getNumber());
            branchBase.setStreet(dto.getStreet());
            branchBase.setNumber(dto.getNumber());
        }
        BranchEntity saved = branchRepository.save(branchBase);
        return branchMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        BranchEntity branch = getEntity(id);
        if (tableRepository.hasActiveTables(branch.getId())) throw new BusinessException("Cannot delete branch which has active tables");

        branchRepository.delete(branch);
    }
}
