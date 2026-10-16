package com.jll.cibus.role.entity;

import com.jll.cibus.role.enums.Permits;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor

public class PermitEntity {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    Long id;

    @Enumerated (EnumType.STRING)
    @Column (nullable= false, unique = true)
    Permits permit;
}
