package com.jll.cibus.branch.controller;

import com.jll.cibus.branch.dto.BranchRequestDTO;
import com.jll.cibus.branch.dto.BranchResponseDTO;
import com.jll.cibus.branch.service.BranchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchService branchService;

    public BranchController (BranchService branchService){
        this.branchService = branchService;
    }

    @GetMapping
    public ResponseEntity<List<BranchResponseDTO>> getAll(){
        return ResponseEntity.ok(branchService.getAllBranches());
    }

    @GetMapping("/{branchId}")
    public ResponseEntity<BranchResponseDTO> getBranchById(@PathVariable Long branchId){
        return ResponseEntity.ok(branchService.getBranchById(branchId));
    }

    @GetMapping("/search")
    public ResponseEntity<BranchResponseDTO> getBranchByAddress(@RequestParam String street, @RequestParam Integer number){
        return ResponseEntity.ok(branchService.getBranchByAddress(street, number));
    }

    @PostMapping
    public ResponseEntity<BranchResponseDTO> create(@Valid @RequestBody BranchRequestDTO branch){
        return ResponseEntity.status(HttpStatus.CREATED).body(branchService.create(branch));
    }

    @PutMapping("/{branchId}")
    public ResponseEntity<BranchResponseDTO> update(@PathVariable Long branchId, @Valid @RequestBody BranchRequestDTO branch){
        return ResponseEntity.ok(branchService.update(branchId, branch));
    }

    @DeleteMapping("/{branchId}")
    public ResponseEntity<?> delete(@PathVariable Long branchId){
        branchService.delete(branchId);
        return ResponseEntity.noContent().build();
    }

}
