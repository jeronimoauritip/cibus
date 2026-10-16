package com.jll.cibus.table.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class TableUpdateDTO {

    @Positive
    private Integer number;

    @Min(value=1, message = "The minimun capacity is 1")
    private Integer capacity;

    @Positive
    private Long waiterId;

    @Min(value = 0, message = "X coordinate cannot be negative")
    private Integer posX;

    @Min(value = 0, message = "Y coordinate cannot be negative")
    private Integer posY;

}
