package com.jll.cibus.branchproduct.entity;

import com.jll.cibus.branch.entity.BranchEntity;
import com.jll.cibus.product.entity.ProductEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "branch_products", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"branch_id", "product_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BranchProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "available", nullable = false)
    private Boolean available;

    @Column(name = "price", nullable = false, precision=10, scale=2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private BranchEntity branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    public Boolean isAvailable(){
        return getAvailable();
    }
}
