package com.jll.cibus.branchproduct.specification;

import com.jll.cibus.branchproduct.entity.BranchProductEntity;
import com.jll.cibus.common.exception.BusinessException;
import com.jll.cibus.product.entity.ProductEntity;
import com.jll.cibus.productcategory.entity.ProductCategoryEntity;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.PredicateSpecification;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public class BranchProductSpecification {

    private BranchProductSpecification() {
    }

    public static Specification<BranchProductEntity> equalsBranchId(Long branchId) {
        return (root, query, cb) -> branchId == null || branchId <= 0
                ? cb.conjunction()
                : cb.equal(root.get("branch").get("id"), branchId);
    }

    public static Specification<BranchProductEntity> equalsProductId(Long productId) {
        return (root, query, cb) -> productId == null || productId <= 0
                ? cb.conjunction()
                : cb.equal(root.get("product").get("id"), productId);
    }

    public static Specification<BranchProductEntity> containsProductName(String productName) {
        return (root, query, cb) -> productName == null || productName.isBlank()
                ? cb.conjunction()
                : cb.like(cb.lower(root.get("product").get("name")), "%" + productName.toLowerCase() + "%");
    }

    public static Specification<BranchProductEntity> equalsCategoryId(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null || categoryId <= 0) return cb.conjunction();
            Join<BranchProductEntity, ProductEntity> product = root.join("product");
            Join<ProductEntity, ProductCategoryEntity> category = product.join("category");
            return cb.equal(category.get("id"), categoryId);
        };
    }

    public static Specification<BranchProductEntity> isAvailable(Boolean available) {
        return (root, query, cb) -> available == null
                ? cb.conjunction()
                : cb.equal(root.get("available"), available);
    }

    public static Specification<BranchProductEntity> priceGreaterThanOrEqualTo(BigDecimal minPrice) {
        return (root, query, cb) -> minPrice == null
                ? cb.conjunction()
                : cb.greaterThanOrEqualTo(root.get("price"), minPrice);
    }

    public static Specification<BranchProductEntity> priceLessThanOrEqualTo(BigDecimal maxPrice) {
        return (root, query, cb) -> maxPrice == null
                ? cb.conjunction()
                : cb.lessThanOrEqualTo(root.get("price"), maxPrice);
    }
}
