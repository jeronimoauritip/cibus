package com.jll.cibus.product.repository;

import com.jll.cibus.product.entity.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long>, JpaSpecificationExecutor<ProductEntity> {

    Optional<ProductEntity> findByNameIgnoreCase(String name);

    List<ProductEntity> findAllByNameContainingIgnoreCase(String name);

    List<ProductEntity> findAllByCategory_Id(Long category_id);

}
