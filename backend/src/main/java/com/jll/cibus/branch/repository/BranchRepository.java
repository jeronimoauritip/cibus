package com.jll.cibus.branch.repository;
import com.jll.cibus.branch.entity.BranchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<BranchEntity, Long>
{
    Optional<BranchEntity> findByName(String name);
    Optional<BranchEntity> findByStreetAndNumber (String street, Integer number);
    Boolean existsByName(String name);
    Boolean existsByStreetAndNumber (String street, Integer number);
}
