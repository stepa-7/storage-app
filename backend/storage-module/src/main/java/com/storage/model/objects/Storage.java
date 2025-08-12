package com.storage.model.objects;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Id;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Entity
@Table(name = "storage")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Storage {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private double capacity;

    @ManyToOne
    @JoinColumn(name = "unit_id")
    private Unit unit;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Storage parent;

    private UUID createdBy;
    private boolean isDeleted = false;
}
