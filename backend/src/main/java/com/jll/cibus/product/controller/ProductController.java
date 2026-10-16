package com.jll.cibus.product.controller;

import com.jll.cibus.product.dto.ProductRequestDTO;
import com.jll.cibus.product.dto.ProductResponseDTO;
import com.jll.cibus.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductResponseDTO>> findAll(Pageable pageable,
                                                            @RequestParam(required = false) String name,
                                                            @RequestParam(required = false) Long categoryId,
                                                            @RequestParam(required = false) String categoryName) {
        return ResponseEntity.ok(productService.findAll(pageable, name, categoryId, categoryName));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductResponseDTO> findById(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.findById(productId));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ProductResponseDTO> update(@PathVariable Long productId, @Valid @RequestBody ProductRequestDTO dto) {
        return ResponseEntity.ok(productService.update(productId, dto));
    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> create(@Valid @RequestBody ProductRequestDTO dto) {
        ProductResponseDTO response = productService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> delete(@PathVariable Long productId) {
        productService.delete(productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getProductCategories(){
        return ResponseEntity.ok(productService.getProductCategories());
    }
}
