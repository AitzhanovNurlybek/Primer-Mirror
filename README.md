# Primer Mirror

Сайт компании Primer Mirror — производство зеркал на заказ в Казахстане.
Включает калькулятор стоимости зеркал и админ-панель для управления ценами.

## Структура

```
front/      — React + Vite фронтенд
backend/    — FastAPI бэкенд
```

## Backend

```
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API будет доступен на http://localhost:8000.

### API

| Метод | Путь | Описание |
| --- | --- | --- |
| `POST` | `/api/calculator/estimate` | Расчёт стоимости зеркала по параметрам (возвращает только итоговую цену) |
| `GET` | `/api/company` | Контактная информация компании |
| `POST` | `/api/admin/login` | Вход администратора, возвращает JWT-токен |
| `GET` | `/api/admin/pricing` | Текущие цены и коэффициенты (требует токен) |
| `PUT` | `/api/admin/pricing` | Изменение цен и коэффициентов (требует токен) |

Цены и коэффициенты хранятся в SQLite (`backend/app/data/app.db`) и при первом
запуске заполняются значениями `DEFAULT_*` из `.env`. Дальше они меняются
только через `/api/admin/pricing`.

### Конфигурация (env)

Скопируйте `backend/.env.example` в `backend/.env` и при необходимости измените:

| Переменная | По умолчанию | Описание |
| --- | --- | --- |
| `APP_NAME` | `Primer Mirror API` | Название сервиса |
| `HOST` | `0.0.0.0` | Адрес, на котором слушает сервер |
| `PORT` | `8000` | Порт сервера |
| `CORS_ORIGINS` | `["http://localhost:5173","http://127.0.0.1:5173"]` | Разрешённые origin'ы фронтенда (JSON-массив) |
| `DATABASE_URL` | `sqlite:///./app/data/app.db` | Строка подключения к БД |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | `admin` / `change-me` | Логин и пароль администратора — **обязательно смените** |
| `JWT_SECRET_KEY` | `change-this-secret-key` | Секрет для подписи токенов — **обязательно смените** |
| `JWT_ALGORITHM` | `HS256` | Алгоритм подписи JWT |
| `JWT_EXPIRES_MINUTES` | `720` | Время жизни токена администратора |
| `DEFAULT_PRICE_PER_M2` | `25000` | Цена за м² зеркала (нач. значение) |
| `DEFAULT_EDGE_PROCESSING_PER_M` | `1500` | Обработка кромки за п.м. (нач. значение) |
| `DEFAULT_LIGHTING_PER_M` | `4000` | Подсветка за п.м. периметра (нач. значение) |
| `DEFAULT_FRAME_PER_M` | `3500` | Алюминиевая рама за п.м. (нач. значение) |
| `DEFAULT_MIN_ORDER_PRICE` | `15000` | Минимальная стоимость заказа (нач. значение) |
| `COMPANY_NAME`, `PHONE`, `WHATSAPP`, `INSTAGRAM`, `KASPI_SHOP_URL` | — | Контакты компании, отдаются через `/api/company` |

## Frontend

```
cd front
npm install
npm run dev
```

Сайт будет доступен на http://localhost:5173.

### Конфигурация (env)

Скопируйте `front/.env.example` в `front/.env` и при необходимости измените:

| Переменная | По умолчанию | Описание |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Адрес backend API. Используется централизованно через `front/src/config.js` |
