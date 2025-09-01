# API TheSports

Backend service using Node.js, Express.js, MongoDB, Mongoose, and Docker.

## Cấu trúc thư mục

- `src/config/`: Cấu hình ứng dụng
- `src/controllers/`: Logic xử lý yêu cầu
- `src/models/`: Định nghĩa schema MongoDB
- `src/routes/`: Định nghĩa các API endpoints
- `src/middleware/`: Middleware (xác thực, ủy quyền, ...)
- `src/services/`: Logic nghiệp vụ
- `src/app.js`: Khởi tạo ứng dụng Express

## Chạy bằng Docker

```sh
docker-compose up --build
```
