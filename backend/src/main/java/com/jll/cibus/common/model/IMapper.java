package com.jll.cibus.common.model;

public interface IMapper <E, Req, Res>{

    Res toDTO(E entity);
    E toEntity(Req dto);

}
