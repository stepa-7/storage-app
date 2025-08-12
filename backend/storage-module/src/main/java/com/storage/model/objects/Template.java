package com.storage.model.objects;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Entity
@Table(name = "template")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Template {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private String description;

    @Column(columnDefinition = "jsonb")
    private String schema; // хранится как JSON

    private boolean isDeleted = false;
    private UUID createdBy;
}