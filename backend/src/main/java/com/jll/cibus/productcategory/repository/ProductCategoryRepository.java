package com.jll.cibus.productcategory.repository;

import com.jll.cibus.productcategory.entity.ProductCategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProductCategoryRepository extends JpaRepository<ProductCategoryEntity, Long> {

    Optional<ProductCategoryEntity> findByNameIgnoreCase(String name);

}
