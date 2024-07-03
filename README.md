# Gamble Analytics Platform

## Описание проекта

Этот проект представляет собой аналитическую платформу для обработки данных и событий в реальном времени с использованием Kafka, ClickHouse и других современных технологий. Основная цель проекта — реализовать систему для игровой аналитики, обеспечивающую высокую производительность, масштабируемость и отказоустойчивость.

## Характеристики системы

### Функционал:

1. Сбор данных о действиях пользователей в реальном времени. Как пример сделанные ставки.
2. Обработка и анализ данных.
3. Реалтайм antifraud уведомления.
4. Реалтайм пуши в игровой процесс.

### Нефункциональные требования:

1. **Производительность:** 95% уведомлений должны доставляться конечным пользователям в течение 10 секунд.
2. **Масштабируемость:** Система должна поддерживать линейное масштабирование производительности при увеличении нагрузки в 10 раз.
3. **Высокая доступность:** Система должна обеспечивать 99.9% uptime.

## Технологический стек и архитектурные решения

### Основные компоненты:

- **Nginx:** Используется для балансировки трафика между серверами API Gateway на уровне L7 (HTTP) и поддержки WebSocket.
- **NestJS:** Основной фреймворк для backend.
- **WebSocket и gRPC:** Используются для транспорта данных в реальном времени.
- **Apache Kafka:** Шина событий для обработки потоковых данных.
- **ClickHouse:** Колоночная база данных для аналитики.
- **Grafana:** Средство для визуализации и аналитики.

## Архитектурные решения для масштабируемости, доступности и отказоустойчивости

### Nginx

- **Использование:** Балансировка трафика между серверами API Gateway.
- **Особенности:** Конфигурация с использованием `hash $remote_addr consistent` для стабильного распределения нагрузки.

### API Gateway

- **Поднято несколько инстансов:** Обеспечение высокой доступности и масштабируемости.

### Stream Processor

- **Использование consumer групп:** Распределение обработки партиций между инстансами.
- **Формирование батчей сообщений:** Эффективная запись данных в ClickHouse.

### Kafka

- **Кластер:** Развертывание в виде кластера с несколькими брокерами.
- **Фактор репликации:** Установлен на 3 для надежности данных и их доступности даже при выходе из строя одного или двух брокеров.
- **Горизонтальное масштабирование:** Каждый брокер обрабатывает часть нагрузки.

### ClickHouse

- **Кластер с двумя шардами и фактором репликации 2:** Высокая доступность и отказоустойчивость.
- **Прокси load balancer:** Распределение запросов между узлами кластера.

<table width="100%">
  <tr>
    <td align="center" valign="middle" width="17%">
      <a href="https://nestjs.com/">
        <img height="50" alt="NestJS" src="https://ih1.redbubble.net/image.1320015801.6889/tst,small,507x507-pad,600x600,f8f8f8.jpg"/>
      </a>
      <br />
      NestJS
    </td>
    <td align="center" valign="middle" width="17%">
      <a href="https://clickhouse.com/">
        <img height="50" alt="Clickhouse" src="https://forgeglobal.com/site/assets/files/7338/1664384702819-clickhouse-logo-500w-1.png"/>
      </a>
      <br />
      Clickhouse
    </td>
    <td align="center" valign="middle" width="17%">
      <a href="https://socket.io/">
        <img height="50" alt="Socket.IO" src="https://upload.wikimedia.org/wikipedia/commons/9/96/Socket-io.svg"/>
      </a>
      <br />
      Socket.IO
    </td>
  </tr>
  <tr>
    <td align="center" valign="middle" width="17%">
      <a href="https://grpc.io/">
        <img height="50" alt="gRPC" src="https://grpc.io/img/logos/grpc-icon-color.png"/>
      </a>
      <br />
      gRPC
    </td>
    <td align="center" valign="middle" width="17%">
      <a href="https://grafana.com/">
        <img height="50" alt="Grafana" src="https://ih1.redbubble.net/image.4230702817.6993/st,small,507x507-pad,600x600,f8f8f8.u1.jpg"/>
      </a>
      <br />
      Grafana
    </td>
  </tr>
  <tr>
    <td align="center" valign="middle" width="17%">
      <a href="https://www.nginx.com/">
        <img height="50" alt="Nginx" src="https://logowik.com/content/uploads/images/nginx7281.logowik.com.webp"/>
      </a>
      <br />
      Nginx
    </td>
  </tr>
</table>

## Установка и запуск

### Скопируйте репозиторий

```shell
git clone https://github.com/chebok/gamble-analytics.git
```

Создайте в корне репозитория .env файл, или воспользуйтесь .env example

### С использованием Docker

```shell
docker compose up --build
# -d - для запуска в фоне
# --build - для повторной пересборки контейнеров
```