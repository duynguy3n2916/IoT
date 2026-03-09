# SmartHome Backend (MySQL + MQTT)

Backend này triển khai đúng các luồng:

- Thu thập sensor từ MQTT -> lưu MySQL (`sensor_readings`)
- Điều khiển thiết bị qua API -> publish MQTT -> chờ phản hồi status (`WAITING -> SUCCESS/FAILED`)
- Truy vấn phân trang cho Sensor Data và Action History

## Cấu trúc thư mục backend

```text
backend/src
  app.js
  server.js
  config/
    env.js
    db.js
  controllers/
    health.controller.js
    device.controller.js
    sensor.controller.js
    actionHistory.controller.js
  routes/
    health.routes.js
    device.routes.js
    sensor.routes.js
    actionHistory.routes.js
    index.js
  services/
    mqtt.service.js
  realtime/
    socket.js
  utils/
    pagination.js
    sensor.js
```

## 1) Cài đặt

```bash
cd backend
npm install
```

## 2) Cấu hình môi trường

```bash
cp .env.example .env
```

Sửa `.env`:

- `MYSQL_*`: thông tin MySQL
- `MQTT_URL`: broker MQTT (TCP), ví dụ `mqtt://localhost:1883`
- `MQTT_SENSOR_TOPIC`: topic sensor ESP publish, mặc định `smarthome/sensors`
- `MQTT_STATUS_WILDCARD`: topic status từ ESP, mặc định `smarthome/+/status`
- `CORS_ORIGIN`: frontend URL, ví dụ `http://localhost:3000`

## 3) Tạo DB schema và seed

```bash
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
```

## 4) Chạy backend

```bash
npm run dev
```

## 5) API chính

- `GET /health`
- `GET /api/devices`
- `POST /api/device/control` body:
  - `{ "deviceKey": "ac", "state": "ON" }`
- `GET /api/sensors?range=12h`
- `GET /api/sensors-data?page=1&limit=20&sensor=temp`
- `GET /api/action-history?page=1&limit=20&status=WAITING`

## 6) MQTT topic cho ESP8266

- Sensor publish: `smarthome/sensors`
  - payload JSON ví dụ: `{"temp":29.5,"hum":61,"lux":430}`
- Lệnh điều khiển backend publish:
  - `smarthome/ac` -> `ON|OFF`
  - `smarthome/tv` -> `ON|OFF`
  - `smarthome/computer` -> `ON|OFF`
- ESP phản hồi status:
  - `smarthome/ac/status` -> `ON|OFF`
  - `smarthome/tv/status` -> `ON|OFF`
  - `smarthome/computer/status` -> `ON|OFF`
