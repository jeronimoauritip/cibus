package com.jll.cibus.productcategory.controller;

import com.jll.cibus.productcategory.dto.ProductCategoryRequestDTO;
import com.jll.cibus.productcategory.dto.ProductCategoryResponseDTO;
import com.jll.cibus.productcategory.service.ProductCategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping ("/api/product-categories")
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    public ProductCategoryController(ProductCategoryService productCategoryService) {
        this.productCategoryService = productCategoryService;
    }

    @GetMapping
    public ResponseEntity<List<ProductCategoryResponseDTO>> getAll ()
    {
        return ResponseEntity.ok(productCategoryService.findAll());
    }

    @GetMapping ("/{productCategoryId}")
    public ResponseEntity<ProductCategoryResponseDTO> getById (@PathVariable Long productCategoryId)
    {
        return ResponseEntity.ok(productCategoryService.findById(productCategoryId));
    }
    @GetMapping ("/name/{name}")
    public ResponseEntity<ProductCategoryResponseDTO> getByName (@PathVariable String name)
    {
        return ResponseEntity.ok(productCategoryService.findByName(name));
    }

    @PostMapping
    public ResponseEntity<ProductCategoryResponseDTO> createProductCategory (@Valid @RequestBody ProductCategoryRequestDTO dto)
    {
        ProductCategoryResponseDTO response = productCategoryService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PutMapping ("/{productCategoryId}")
    public ResponseEntity<ProductCategoryResponseDTO> updateProductCategory (@PathVariable Long productCategoryId,@Valid @RequestBody ProductCategoryRequestDTO dto)
    {
        return ResponseEntity.ok(productCategoryService.update(productCategoryId,dto));
    }
    @DeleteMapping ("/{productCategoryId}")
    public ResponseEntity<Void> deleteProductCategory (@PathVariable Long productCategoryId)
    {
        productCategoryService.delete(productCategoryId);
        return ResponseEntity.noContent().build();
    }


}
