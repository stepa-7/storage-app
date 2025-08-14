# Документация проекта «Система хранения» (Frontend)

## 📂 Структура каталога `/docs`

```
docs/
├── api/                # API-спецификации и описание интеграций
│   └── front-api-gateway.openapi.yaml
├── diagrams/           # Архитектурные схемы и диаграммы
│   └── c4-02-containers.png
├── specs/              # Основные проектные документы и ТЗ
│   ├── 01-case4-storage-system_ru_v1.0.pdf
│   └── 02-technical-spec_ru_v1.0.docx
├── wireframes/         # Вайрфреймы (каркасные макеты) интерфейсов
│   ├── index.html
│   ├── storage.html
│   ├── templates.html
│   ├── login.html
│   ├── object-new.html
│   ├── object-view.html
│   └── styles.css
```

---

## 📑 Описание разделов

### [`api/`](./api)

Содержит **OpenAPI/Swagger** спецификацию для фронтенд-разработки:

- [`front-api-gateway.openapi.yaml`](./api/front-api-gateway.openapi.yaml) — описание REST API шлюза для интеграции с бекендом.

### [`diagrams/`](./diagrams)

Архитектурные схемы проекта:

- [`c4-02-containers.png`](./diagrams/c4-02-containers.png) — диаграмма C4 (уровень 2, контейнеры) с обзором основных сервисов и хранилищ.

### [`specs/`](./specs)

Проектные документы:

- [`01-case4-storage-system_ru_v1.0.pdf`](./specs/01-case4-storage-system_ru_v1.0.pdf) — описание кейса 4 «Система хранения» (контекст, цели, ограничения).
- [`02-technical-spec_ru_v1.0.docx`](./specs/02-technical-spec_ru_v1.0.docx) — техническое задание на реализацию.

### [`wireframes/`](./wireframes)

Вайрфреймы интерфейсов (HTML+CSS):

- Основные экраны: хранилища, шаблоны, формы входа, карточки объектов.
- Используются для согласования UI/UX до начала разработки.

---

## 🔗 Полезные ссылки

- Открыть Swagger спецификацию в [Swagger Editor](https://editor.swagger.io/) — **File → Import URL** и вставить ссылку на [`front-api-gateway.openapi.yaml`](./api/front-api-gateway.openapi.yaml).
- Редактировать C4-диаграмму в [draw.io](https://app.diagrams.net/) или аналогичном редакторе.

---

## 📜 Версии

- **v1.0**

---

© Команда проекта, 2025
