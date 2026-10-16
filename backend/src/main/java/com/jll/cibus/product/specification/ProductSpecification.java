package com.jll.cibus.product.specification;

import com.jll.cibus.product.entity.ProductEntity;
import jakarta.persistence.criteria.Expression;
import org.springframework.data.jpa.domain.Specification;

public class ProductSpecification {

    private ProductSpecification() {}

    public static Specification<ProductEntity> nameContains(String name) {
        return (root, query, cb) -> name == null || name.isBlank()
                ? cb.conjunction()
                : cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<ProductEntity> equalsCategoryId(Long categoryId) {
        return (root, query, cb) -> categoryId == null || categoryId <= 0
                ? cb.conjunction()
                : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<ProductEntity> equalsCategoryName(String categoryName) {
        return (root, query, cb) -> {
            if (categoryName == null || categoryName.isBlank()) {
                return cb.conjunction();
            }
            Expression<String> categoryNameWithoutSpaces = cb.function("replace", String.class,
                    cb.lower(root.get("category").get("name")), cb.literal(" "), cb.literal(""));
            return cb.like(categoryNameWithoutSpaces, "%" + categoryName.toLowerCase().replace(" ", "") + "%");
        };
    }

}
