package com.jll.cibus.table.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TableCreateDTO {

    @NotNull(message ="The table number is mandatory")
    @Positive
    private Integer number;

    @NotNull(message ="The capacity is mandatory")
    @Min(value=1, message = "The minimun capacity is 1")
    private Integer capacity;

    @NotNull(message = "The X coordinate is mandatory")
    @Min(value = 0, message = "X coordinate cannot be negative")
    private Integer posX;

    @NotNull(message = "The Y coordinate is mandatory")
    @Min(value = 0, message = "Y coordinate cannot be negative")
    private Integer posY;

}
