# Автоматическая синхронизация тарифов Wildberries в Google Sheets.

## Описание

 - Каждый час получает тарифы из API Wildberries
 - Сохраняет в PostgreSQL с UPSERT (защита от дублей)
 - Экспортирует в Google Sheets (лист stocks_coefs)
 - Данные сортируются по коэффициенту

## Запуск

1. Клонировать репозиторий
git clone https://github.com/AlexDubrovskii/btlz-wb-test.git
cd btlz-wb-test

2. Создать .env

3. Заполнить .env и положить google-service-account.json в корень

4. Запустить
docker compose up --build

## Переменные окружения:

WB_API_TOKEN - Токен API Wildberries  
GOOGLE_SERVICE_ACCOUNT_KEY_PATH - Путь к ключу Google (./google-service-account.json)  
GOOGLE_SHEET_IDS - ID Google таблиц (через запятую)  
DB_HOST - Хост PostgreSQL (postgres)  
POSTGRES_USER - Пользователь БД (postgres)  
POSTGRES_PASSWORD - Пароль БД (postgres)  

## База данных

Таблица tariffs:
 tariff_date — дата тарифа  
 box_type — склад  
 coefficient — коэффициент  
 price_rub — цена  
 min_weight_kg — мин. вес  
 fetched_at — время получения  
