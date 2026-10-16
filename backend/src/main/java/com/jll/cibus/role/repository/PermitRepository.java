package com.jll.cibus.role.repository;

import com.jll.cibus.role.entity.PermitEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PermitRepository extends JpaRepository<PermitEntity,Long> {
}
