package com.jll.cibus.table.controller;

import com.jll.cibus.table.dto.TableCreateDTO;
import com.jll.cibus.table.dto.TableUpdateDTO;
import com.jll.cibus.table.dto.TableResponseDTO;
import com.jll.cibus.table.service.TableService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/branches/{branchId}/tables")
public class TableController {
    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    @GetMapping
    public ResponseEntity<Page<TableResponseDTO>> findAll (Pageable pageable,
                                                            @RequestParam(required = false) Integer tableNumber,
                                                            @RequestParam (required = false)  Integer capacity,
                                                            @RequestParam (required = false) Boolean available,
                                                            @RequestParam(required = false) Long waiterId,
                                                           @PathVariable Long branchId) {
       return ResponseEntity.ok(tableService.findAll(pageable,branchId,tableNumber,capacity,available,waiterId));
    }


    @GetMapping("/{tableNumber}")
    public ResponseEntity<TableResponseDTO> getByNumber(@PathVariable Long branchId, @PathVariable Integer tableNumber) {
        return ResponseEntity.ok(tableService.findByNumber(branchId, tableNumber));
    }

    @PostMapping
    public ResponseEntity<TableResponseDTO> create(@PathVariable Long branchId, @Valid @RequestBody TableCreateDTO dto) {
        TableResponseDTO response = tableService.create(dto, branchId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/occupy/{tableNumber}")
    public ResponseEntity<TableResponseDTO> occupy(@PathVariable Long branchId, @PathVariable Integer tableNumber, @Valid @RequestBody TableUpdateDTO table) {
        return ResponseEntity.ok(tableService.occupy(branchId, tableNumber, table.getWaiterId()));
    }

    @PatchMapping("/free/{tableNumber}")
    public ResponseEntity<TableResponseDTO> free(@PathVariable Long branchId, @PathVariable Integer tableNumber) {
        return ResponseEntity.ok(tableService.free(branchId, tableNumber));
    }

    @PutMapping("/{tableNumber}")
    public ResponseEntity<TableResponseDTO> update(@PathVariable Long branchId, @PathVariable Integer tableNumber, @Valid @RequestBody TableUpdateDTO table) {
        return ResponseEntity.ok(tableService.update(branchId, tableNumber, table));
    }

    @DeleteMapping("/{tableNumber}")
    public ResponseEntity<Void> delete(@PathVariable Long branchId, @PathVariable Integer tableNumber) {
        tableService.delete(branchId, tableNumber);
        return ResponseEntity.noContent().build();
    }
}
