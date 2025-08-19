# AuthService

## Описание проекта

AuthService — это сервис аутентификации и авторизации, реализованный на Spring Boot.

### Ключевые особенности:

* Регистрация и вход пользователей с ролями (GUEST, ADMIN)
* Защищенные REST API с разграничением доступа по ролям
* JWT (JSON Web Token) для аутентификации
* Refresh токены, хранящиеся в HttpOnly cookie, для продления сессии
* Управление ролями пользователей через REST API (только для ADMIN)
* Поддержка Docker и Docker Compose для быстрого запуска с PostgreSQL

### Безопасность

* JWT access token с временем жизни (по умолчанию 1 минута)
* Refresh token хранится в HttpOnly, Secure cookie, действует 1 день
* Все защищенные эндпоинты требуют соответствующей роли
* При выходе refresh token удаляется

## Начало работы

### Требования

* Java 17+
* Maven
* Docker и Docker Compose

### Шаги

1. Склонируйте репозиторий

2. Создайте файл `.env` в корневой директории со следующим содержимым (пример):

```ini
DB_URL=jdbc:postgresql://db:5432/postgres
DB_USERNAME=postgres
DB_PASSWORD=7561

POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=7561

JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION_MS=60000
REFRESH_TOKEN_EXPIRATION_MS=86400000

HOST_PORT=8080
CONTAINER_PORT=8080
```

3. Соберите приложение:

```bash
mvn clean package
```

4. Запустите сервис и базу данных через Docker Compose:

```bash
docker-compose up --build
```

Приложение будет доступно по адресу:

```
http://localhost:8080
```

### Конфигурация

* Переменные окружения (из `.env`) автоматически подставляются в приложение и docker-compose.
* Настройки базы данных, JWT-секреты, время жизни токенов и порты настраиваются через переменные окружения.

## Эндпоинты API

### 1. Регистрация пользователя

`POST /auth/signup`

**Описание**: Создает нового пользователя с заданными ролями. Если роли не переданы, по умолчанию назначается GUEST.

**cURL-запрос**

```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
        "login": "user1",
        "email": "user1@example.com",
        "password": "password123",
        "roles": ["GUEST", "ADMIN"]
      }'
]
```

**Ответ**:

* `200 OK` — при успешной регистрации
* `400 Bad Request` — если логин или email уже заняты

### 2. Вход (аутентификация)

`POST /auth/signin`

**Описание**: Аутентифицирует пользователя и выдает JWT access token и refresh token (в cookie).

**cURL-запрос**:

```bash
curl -X POST http://localhost:8080/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
        "login": "user1",
        "password": "password123"
      }'
```

-c cookies.txt сохраняет refresh token в cookie для последующего использования.

**Ответ**:

* `200 OK` с JSON:

```json
{
  "accessToken": "jwt_access_token_here",
  "tokenType": "Bearer",
  "expiresIn": 60000
}
```

Refresh токен устанавливается в HttpOnly cookie.

* `401 Unauthorized` — при неверных данных.

### 3. Обновление токена

`POST /auth/refresh`с

**Описание**: Использует refresh token из cookie, чтобы выдать новый access token и обновить refresh token.

**cURL-запрос**

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

**Ответ**:

* `200 OK` с новым access token и обновленным refresh токеном в cookie.
* `401 Unauthorized` — если токен отсутствует или истек.

### 4. Выход (logout)

`POST /auth/logout`

**Описание**: Удаляет refresh токен из базы и сбрасывает cookie.

**cURL-запрос**

```bash
curl -X POST http://localhost:8080/auth/logout \
  -b cookies.txt
```

**Ответ**: `200 OK`

### 5. Получить профиль

`GET /profile`

**Описание**: Доступен всем авторизованным пользователям. Возвращает подтверждение авторизации.

**cURL-запрос**

```bash
curl -X GET http://localhost:8080/profile \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 6. Получить всех пользователей (только ADMIN)

`GET /admin/users`

**Описание**: Возвращает список всех пользователей.

**cURL-запрос**

```bash
curl -X GET http://localhost:8080/admin/users \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 7. Обновить роли пользователя (только ADMIN)

`PUT /user/{id}/roles`

**Описание**: Обновляет роли пользователя по ID.

**cURL-запрос**

```bash
curl -X PUT http://localhost:8080/user/1/roles \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '["GUEST", "ADMIN"]'
```

## Роли пользователей

* `GUEST` — обычный пользователь
* `ADMIN` — администратор, может управлять ролями пользователей
