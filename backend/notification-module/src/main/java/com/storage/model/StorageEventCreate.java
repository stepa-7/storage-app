package com.storage.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.UUID;

@Data
public class StorageEventCreate {

    private UUID storageId;
    // измеряем в процентах
    @Max(value = 100, message = "Upper border is higher then 100%")
    @Min(value = 0, message = "Upper border is lower then 0%")
    private Double upperLimit = 100.;
    @Max(value = 100, message = "Lower border is higher then 100%")
    @Min(value = 0, message = "Lower border is lower then 0%")
    private Double lowerLimit = 0.;
}
