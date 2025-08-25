# 🏗️ T1 Vault — Система хранения (Команда 29)

> **Кейс 4**  
> Заказчик: **Соболев Михаил Юрьевич**  
> Команда: **29**  

## 🧠 GitLab

###  Первый запуск проекта
```bash
git config --global http."https://it-camp.innoca.local".sslVerify false
git clone https://it-camp.innoca.local/IT-CAMP-CS-S-111/t1-team29-vault.git
cd t1-team29-vault
```
### 🚀 Как внести изменения 
```bash
git pull https://it-camp.innoca.local/IT-CAMP-CS-S-111/t1-team29-vault.git
git switch -c dev-task-{number}
git add .
git commit -m "... Task #{number}"
git push origin dev-task-{number}
```
Создать Pull Request используя GitLab UI
## ⚙️ Архитектура CI/CD

### 1. Backend Pipeline (`backend/.gitlab-ci.yml`)
- **Docker stage**:  
  Собирает и пушит Docker-образы для сервисов:
  - `api-gateway`
  - `auth-service`
  - `storage-module`
  - `qr-module`

- **Deploy stage**:  
  Через Ansible:
  - Устанавливает Docker + docker-compose на сервере  
  - Разворачивает `docker-compose.yml` из шаблона  
  - Настраивает Nginx как reverse-proxy на **порт 80 → gateway**

---

### 2. Frontend Pipeline (`frontend/.gitlab-ci.yml`)
- **Build stage**:  
  - Собирает фронт в Docker-образ  
  - Пушит в реестр  

- **Deploy stage**:  
  - Через Ansible поднимает контейнер `nginx:alpine`  
  - Кладёт собранный frontend-образ  
  - Настраивает прокси на backend API  

---

### 3. Orchestration Pipeline (`.gitlab-ci.yml` в корне)
- Определяет **стадии `backend` и `frontend`**
- Триггерит соответствующие пайплайны для подпроектов

---

## 🌍 Деплой

Все деплои идут на сервер:

- **Backend API**: `http://<server>/api`  
- **Frontend (SPA)**: `http://<server>/`  

---

## 🔑 Переменные окружения (GitLab CI/CD → Settings → Variables)

- `DEPLOY_KEY` — приватный SSH ключ для доступа к серверу  
- `CI_REGISTRY`, `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD` — Docker Registry  
- `AUTH_POSTGRES_*`, `STORAGE_POSTGRES_*` — креды для баз  
- `JWT_SECRET` — секрет для токенов  
- `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` — доступ к MinIO  

---