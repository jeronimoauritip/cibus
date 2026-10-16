package com.jll.cibus.table.service;


import com.jll.cibus.auth.AuthService;
import com.jll.cibus.branch.repository.BranchRepository;
import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.credential.entity.CredentialsEntity;
import com.jll.cibus.credential.repository.CredentialsRepository;
import com.jll.cibus.role.enums.Roles;
import com.jll.cibus.table.dto.TableCreateDTO;
import com.jll.cibus.table.dto.TableUpdateDTO;
import com.jll.cibus.table.dto.TableResponseDTO;
import com.jll.cibus.table.entity.TableEntity;
import com.jll.cibus.table.mapper.TableMapper;
import com.jll.cibus.table.repository.TableRepository;
import com.jll.cibus.table.specification.TableSpecification;
import com.jll.cibus.user.entity.UserEntity;
import com.jll.cibus.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TableServiceImpl implements TableService {

    private final TableRepository tableRepository;
    private final TableMapper tableMapper;
    private final BranchRepository branchRepository;
    private final CredentialsRepository credentialsRepository;
    private final UserRepository userRepository;
    private final AuthService authService;


    private TableEntity getTableByBranchIdAndNumber(Long branchId, Integer number) {
        return tableRepository.findByBranch_IdAndNumber(branchId, number)
                .orElseThrow(() -> new ResourceNotFoundException("table number", number));
    }

    private void authenticateUserBelongsInBranch(Long branchId){
        if(!branchRepository.existsById(branchId)){
            throw new ResourceNotFoundException("branch ID", branchId);
        }
        authService.authenticateUserBelongsInBranch(branchId);
    }

    @Override
    public Page<TableResponseDTO> findAll( Pageable pageable,Long branchId, Integer tableNumber, Integer capacity, Boolean available, Long waiterId){
        authenticateUserBelongsInBranch(branchId);
        Specification<TableEntity> spec = Specification.allOf(
                TableSpecification.equalsBranchId(branchId),
                TableSpecification.equalsTableNumber(tableNumber),
                TableSpecification.equalsCapacity(capacity),
                TableSpecification.isAvailable(available),
                TableSpecification.equalsWaiterId(waiterId));
        return tableRepository.findAll(spec,pageable)
                .map(tableMapper::toDTO);
    }

    @Override
    public TableResponseDTO findByNumber(Long branchId, Integer tableNumber) {
        authenticateUserBelongsInBranch(branchId);
        TableEntity table = getTableByBranchIdAndNumber(branchId, tableNumber);
        return tableMapper.toDTO(table);
    }

    @Override
    public Boolean existsByBranchIdAndNumber(Long branchId, Integer tableNumber){
        return tableRepository.existsByBranchIdAndNumber(branchId, tableNumber);
    }

    @Override
    @Transactional
    public TableResponseDTO create(TableCreateDTO dto, Long branchId) {
        authenticateUserBelongsInBranch(branchId);
        if(tableRepository.existsByBranchIdAndNumber(branchId, dto.getNumber())){
            throw new BusinessException("A table with number "+ dto.getNumber() +" already exists in the branch.");
        }
        TableEntity table = tableMapper.toEntity(dto);
        table.setBranch(branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("branch", branchId)));
        table.setAvailable(Boolean.TRUE);
        table.setWaiter(null);
        TableEntity saved = tableRepository.save(table);
        return tableMapper.toDTO(saved);
    }

    private void validateWaiterRole(Long waiterId) {
        CredentialsEntity waiterCredentials = credentialsRepository
                .findByUser_Id(waiterId)
                .orElseThrow(() -> new BusinessException("The user with id " + waiterId + " has no credentials"));

        Roles role = waiterCredentials.getUser().getRole().getRole();

        if (role != Roles.WAITER
                && role != Roles.HOST
                && role != Roles.MANAGER) {
            throw new BusinessException(
                    "The user must have role WAITER, HOST or MANAGER");
        }
    }

    @Override
    @Transactional
    public TableResponseDTO occupy(Long branchId, Integer tableNumber, Long waiterId) {

        authenticateUserBelongsInBranch(branchId);

        TableEntity table = getTableByBranchIdAndNumber(branchId, tableNumber);
        if (waiterId == null)
            throw new BusinessException("Waiter ID is required to occupy a table");

        if (!table.getAvailable())
            throw new BusinessException("The table is already occupied");

        UserEntity waiter = userRepository.findById(waiterId)
                .orElseThrow(()->new ResourceNotFoundException("waiter", waiterId));
        validateWaiterRole(waiterId);

        table.setAvailable(false);
        table.setWaiter(waiter);
        TableEntity updatedTable = tableRepository.save(table);

        return tableMapper.toDTO(updatedTable);
    }

    @Override
    @Transactional
    public TableResponseDTO free(Long branchId, Integer tableNumber) {

        authenticateUserBelongsInBranch(branchId);

        TableEntity table = getTableByBranchIdAndNumber(branchId, tableNumber);
        if (table.getAvailable()) {
            throw new BusinessException("The table is already free");
        }

        table.setAvailable(true);
        table.setWaiter(null);
        TableEntity updatedTable = tableRepository.save(table);

        return tableMapper.toDTO(updatedTable);
    }

    @Override
    @Transactional
    public TableResponseDTO update(Long branchId, Integer tableNumber, TableUpdateDTO newTable) {

        authenticateUserBelongsInBranch(branchId);

        TableEntity table = getTableByBranchIdAndNumber(branchId, tableNumber);
        if(newTable.getNumber() != null){
            table.setNumber(newTable.getNumber());
        }

        if(existsByBranchIdAndNumber(branchId, newTable.getNumber())) throw new BusinessException("There is another table with the same number.");

        if (newTable.getCapacity() != null) {
            if (newTable.getCapacity() < 1) {
                throw new BusinessException("The capacity can not be less than 1");
            }

            table.setCapacity(newTable.getCapacity());
        }

        if (newTable.getWaiterId() != null) {
            UserEntity newWaiter = userRepository.findById(newTable.getWaiterId())
                    .orElseThrow(()-> new ResourceNotFoundException("user",newTable.getWaiterId()));
            validateWaiterRole(newWaiter.getId());

            table.setWaiter(newWaiter);
        }

        TableEntity updatedTable = tableRepository.save(table);
        return tableMapper.toDTO(updatedTable);
    }

    @Override
    @Transactional
    public void delete(Long branchId, Integer tableNumber) {
        authenticateUserBelongsInBranch(branchId);
        TableEntity table = getTableByBranchIdAndNumber(branchId, tableNumber);
        tableRepository.delete(table);
    }
}

