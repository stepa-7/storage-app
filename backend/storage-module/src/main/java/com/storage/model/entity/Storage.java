package com.storage.model.entity;


import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.Id;

import java.util.UUID;

@Entity
@Table(name = "storage")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class Storage {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private double capacity;
    private double fullness = 0.0;

    @Column(name = "unit_id")
    private UUID unitId;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "created_by")
    private UUID createdBy;
    @Column(name = "is_deleted")
    private boolean isDeleted = false;
}
