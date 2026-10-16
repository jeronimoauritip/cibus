package com.jll.cibus.branchproduct.controller;

import com.jll.cibus.branchproduct.dto.BranchProductRequestDTO;
import com.jll.cibus.branchproduct.dto.BranchProductResponseDTO;
import com.jll.cibus.branchproduct.dto.BranchProductUpdateDTO;
import com.jll.cibus.branchproduct.service.BranchProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import java.math.BigDecimal;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/branches/{branchId}/products")
public class BranchProductController {

    private final BranchProductService branchProductService;

    @GetMapping
    public ResponseEntity<Page<BranchProductResponseDTO>> findAll(Pageable pageable,
                                                                  @PathVariable Long branchId,
                                                                  @RequestParam(required = false) Long productId,
                                                                  @RequestParam(required = false) String productName,
                                                                  @RequestParam(required = false) Long categoryId,
                                                                  @RequestParam(required = false) Boolean available,
                                                                  @RequestParam(required = false) BigDecimal minPrice,
                                                                  @RequestParam(required = false) BigDecimal maxPrice){

        return ResponseEntity.ok(branchProductService.findAll(pageable, branchId, productId, productName, categoryId, available, minPrice, maxPrice));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<BranchProductResponseDTO> getByBranchIdAndProductId(@PathVariable Long branchId, @PathVariable Long productId){
        return ResponseEntity.ok(branchProductService.getByBranchAndProduct(branchId, productId));
    }

    @PostMapping
    public ResponseEntity<BranchProductResponseDTO> create(@PathVariable Long branchId, @Valid @RequestBody BranchProductRequestDTO dto){
        return ResponseEntity.status(HttpStatus.CREATED).body(branchProductService.create(branchId, dto));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<BranchProductResponseDTO> update(@PathVariable Long branchId, @PathVariable Long productId, @Valid @RequestBody BranchProductUpdateDTO dto){
        return ResponseEntity.ok(branchProductService.update(branchId, productId, dto));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> delete(@PathVariable Long branchId, @PathVariable Long productId){
        branchProductService.delete(branchId, productId);
        return ResponseEntity.noContent().build();
    }

}
