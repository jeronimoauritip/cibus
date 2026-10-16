package com.jll.cibus.table.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class TableResponseDTO {
    private Long id;
    private Integer number;
    private Integer capacity;
    private Boolean available;
    private Integer posX;
    private Integer posY;
    private Long waiterId;
    private Long branchId;

}
