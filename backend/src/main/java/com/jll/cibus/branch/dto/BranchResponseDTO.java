package com.jll.cibus.branch.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class BranchResponseDTO
{
    private Long id;
    private String name;
    private String street;
    private Integer number;
}
