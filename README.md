# Travel-AI Backend

REST API NestJS 11 cho nền tảng lập lịch du lịch: PostgreSQL/pgvector, OpenAI RAG, Redis cache, JWT rotation, RBAC và Cloudinary.

## Tính năng

- Auth bằng access token 15 phút và refresh token xoay vòng trong cookie httpOnly.
- Trip CRUD, itinerary, tối ưu tuyến theo khoảng cách, chi phí và public sharing.
- RAG semantic retrieval, chat streaming NDJSON, conversation memory và lịch sử chat.
- Recommendation kết hợp yêu cầu hiện tại, favorite/review và vector similarity.
- Place full-text search, pagination, review và favorite.
- Upload ảnh Cloudinary, rate limit, Swagger, health check và Sentry tùy chọn.
- TypeORM migrations cho schema, pgvector/HNSW và GIN full-text index.

## Chạy local

Yêu cầu Node.js 22+, PostgreSQL có extension pgvector và Redis (Redis không bắt buộc vì có memory fallback).

```bash
copy .env.example .env
npm ci
npm run migration:run
npm run seed:run
npm run dev
```

- API: `http://localhost:8080/api/v1`
- Swagger: `http://localhost:8080/api/docs`
- Health: `http://localhost:8080/api/v1/health`

Trong development có thể đặt `DB_SYNCHRONIZE=true`. Production luôn tắt synchronize và tự chạy migration đã commit.

## Biến môi trường

Xem `.env.example`. Các secret bắt buộc khi production là `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET` và `OPENAI_API_KEY`. Cloudinary và Sentry là tích hợp tùy chọn; để trống khi chưa cấu hình.

## Kiểm tra

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
npm audit
```

E2E backend cần một PostgreSQL test; workflow GitHub Actions đã khai báo service `pgvector/pgvector:pg17`.

## Docker Compose

Từ thư mục này:

```bash
docker compose up --build
```

Stack gồm PostgreSQL/pgvector (`5433`), Redis (`6379`), API (`8080`) và frontend (`3000`). Trước khi deploy, thay toàn bộ secret mặc định và đặt `CORS_ORIGINS` thành domain thật.

## Migration

```bash
npm run migration:generate -- src/database/migrations/TenMigration
npm run migration:run
npm run migration:revert
```

Không dùng `synchronize` để thay đổi schema production.
