package com.jll.cibus.product.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponseDTO {

    private Long id;
    private String name;
    private String description;
    private String categoryName;  //uso el nombre y no el id porque creo que va a ser mas util para el front.
}
