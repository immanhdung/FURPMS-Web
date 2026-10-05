# FURPMS-Web (React + Vite)

## Chạy local
```bash
npm install
# (tùy chọn) cấu hình API: cp .env.example .env  — mặc định đã trỏ http://localhost:5068/api
npm run dev   # http://localhost:5173
```
- Cần **BE** chạy ở `:5068` (repo `FURPMS_BE`: `dotnet run --project FURPMS.API`) + **SQL Server docker** (`localhost:1433`).
- Thiếu `.env` vẫn chạy được (mặc định trỏ BE local, không mock — xem `src/constants/env.ts`). Sửa API URL / bật mock qua `.env`.
- ⚠️ `.env` bị gitignore (đúng) — đừng commit; dùng `.env.example` làm mẫu.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
