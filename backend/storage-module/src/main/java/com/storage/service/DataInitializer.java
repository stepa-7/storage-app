package com.storage.service;

import com.storage.model.entity.Unit;
import com.storage.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UnitRepository unitRepository;

    @EventListener(ApplicationReadyEvent.class)
    public void initDefaultUnits() {
        List<Unit> defaultUnits = Arrays.asList(
                createUnit("Килограммы", "кг"),
                createUnit("Штуки", "шт")
        );

        defaultUnits.forEach(this::saveUnitIfNotExists);
    }

    private Unit createUnit(String name, String symbol) {
        return Unit.builder()
                .name(name)
                .symbol(symbol)
                .build();
    }

    private void saveUnitIfNotExists(Unit unit) {
        // Проверяем по имени ИЛИ символу, чтобы избежать дубликатов
        boolean exists = unitRepository.existsByNameOrSymbol(unit.getName(), unit.getSymbol());

        if (!exists) {
            unitRepository.save(unit);
            System.out.println("Создана единица измерения: " + unit.getName() + " (" + unit.getSymbol() + ")");
        }
    }
}