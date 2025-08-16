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

# CI/CD и деплой приложения

## Описание
Проект разворачивается на одном сервере в трёх окружениях:
- **Dev** — порты 8080/8081
- **Test** — порты 8180/8181
- **Prod** — порты 8280/8281

Сборка выполняется через **multi-stage Dockerfile**, образы хранятся в GitLab Container Registry/DockerHub.

## Как работает
1. Разработчик пушит в ветку:
   - `dev-task-*` → окружение dev
   - `test-task-*` → окружение test
   - `prod-task-*` → окружение prod
2. GitLab CI билдит образы и пушит их в Registry/DockerHub.
3. Деплой выполняется через **Ansible** с помощью `docker-compose`.


