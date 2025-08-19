# Используем официальный образ OpenJDK
FROM eclipse-temurin:21-jdk-jammy

# Рабочая директория в контейнере
WORKDIR /app

# Копируем JAR-файл в контейнер
COPY target/api-gateway-*.jar app.jar

# Открываем порт, который указан в application.yaml
EXPOSE 8080

# Команда для запуска приложения
ENTRYPOINT ["java", "-jar", "app.jar"]