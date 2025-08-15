package com.storage.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "unit")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Unit {
    @Id
    @GeneratedValue
    private UUID id;

    private String name;
    private String symbol;
}