# AGENTS.md — FURPMS Frontend

> ## ⚠️ ĐỌC MỤC NÀY TRƯỚC — phần dưới là BẢN THIẾT KẾ BAN ĐẦU
>
> Từ mục `# FURPMS Frontend Development Guide` trở xuống là tài liệu **định hướng thiết kế viết
> lúc khởi động dự án**. Nó vẫn đúng về triết lý giao diện, hệ màu, quy tắc animation, chuẩn bảng
> biểu — cứ theo. Nhưng vài chỗ **đã lệch thực tế**, mục này sửa lại. Chỗ nào mâu thuẫn thì
> **mục này thắng**.

---

## 0. Bạn có đang ở đúng repo không?

| Thư mục | Repo | Trạng thái |
|---|---|---|
| `D:\Downloads\doc\9 đồ án\core\FURPMS-Web` | `immanhdung/FURPMS-Web` | ✅ **FE — chính là repo này** |
| `D:\capstone\FURPMS_BEv2` | `trunghq54/FURPMS_BEv2` | ✅ **BE đang dùng** |
| `D:\Downloads\doc\9 đồ án\FURPMS\FURPMS_BE` | `trunghq54/FURPMS_BE` | ❌ **BE CŨ, chết từ 02/08/2026** |

Có một repo FE cũ đuôi `v0` **đã bỏ hẳn** — không bao giờ đụng tới.

Nhánh làm việc: **`dev`**.

---

## 1. Chạy

```bash
npm install
npm run dev          # → http://localhost:5173, tự trỏ về BE localhost:5068
npm run dev:remote   # dùng BE deploy trên Railway (khi KHÔNG chạy BE local)
```

**Không cần tạo `.env`.** Các file `.env.development` / `.env.remote` / `.env.production` đều đã
commit sẵn. Nếu sửa `.env` mà không thấy tác dụng thì đúng như dự đoán: `.env.development` đè lên
(thứ tự Vite: `.env` < `.env.local` < `.env.[mode]` < `.env.[mode].local`). Cần đè cho riêng máy
mình thì dùng `.env.development.local`.

BE phải chạy trước: xem `AGENTS.md` ở repo `FURPMS_BEv2` (`docker compose up -d` rồi
`dotnet run --project FURPMS.API`).

Kiểm tra trước khi coi là xong:
```bash
npm run typecheck    # tsc --noEmit, phải sạch
npm run build        # phải xanh
```

Tài khoản demo: `admin@furpms.edu.vn`, `staff.demo@`, `pi.demo@`, `pi2.demo@`,
`reviewer1..5.demo@furpms.edu.vn` — tất cả mật khẩu **`password`** (chỉ có ở BE môi trường Development).

---

## 2. Ba chỗ tài liệu bên dưới đã lệch

### 2.1 Thiếu hẳn i18n — mà đây là thứ chạm vào MỌI màn hình

Bản thiết kế không nhắc gì tới đa ngôn ngữ. Thực tế toàn bộ giao diện đi qua **i18next**:

- `src/i18n/locales/vi.ts` và `en.ts` — **hai file phải cân bằng khoá**. Thêm khoá một bên mà quên
  bên kia thì màn hình hiện thẳng chuỗi khoá thô (`users.deleteTitle`) cho người dùng thấy.
- **Không hardcode chuỗi hiển thị.** Mọi văn bản dùng `t("...")`.
- Buổi bảo vệ sẽ demo bằng **tiếng Anh**, nên chuỗi tiếng Việt lọt vào giao diện là lỗi thấy ngay.
- Ngoại lệ: **thông báo lỗi 400/409 từ máy chủ hiện nguyên văn** và chúng đang là tiếng Việt —
  đó là chủ ý (xem `axiosClient.resolveMessage`), không phải chỗ cần "dịch" ở FE.

### 2.2 "Framer Motion" → package thật là **`motion`**

Import `from "motion/react"`, không phải `framer-motion`. (`motion` là bản kế nhiệm cùng tác giả.)

### 2.3 "Mock Strategy" — nay mặc định gọi BE THẬT

Mục đó nói AI, danh mục loại đề tài, tài liệu đề cương… đang mock. **Không còn đúng**: những thứ
ấy đã có endpoint thật, AI chạy Google Gemini thật.

MSW vẫn còn trong repo nhưng **tắt mặc định** và bị chặn hai lớp: chỉ bật khi `import.meta.env.DEV`
**và** `VITE_USE_MOCK_API=true`. Xem `src/mock/handlers/index.ts`. Viết tính năng mới thì gọi BE
thật, đừng thêm mock.

### 2.4 `features/` chia theo VAI, không theo miền nghiệp vụ

Bản thiết kế liệt kê `proposal/`, `council/`, `meeting/`, `contract/`… Thực tế:

```
src/features/
  admin/ staff/ pi/ reviewer/     ← chia theo VAI người dùng
  auth/ dashboard/ home/ notification/ settings/ analytics/
```

Màn hình về hội đồng nằm ở `staff/review-board/` và `reviewer/proposal-review/`, không có thư mục
`council/`. Thư mục thật còn có `src/i18n/` và `src/lib/` (bản thiết kế không liệt kê).

---

## 3. Bẫy đã cắn thật

### 3.1 `NAV_ITEMS` sinh ra bảng route — đừng tách rời

`APP_ROUTE_GROUPS` **suy ra bảng route từ `NAV_ITEMS`** (`src/constants/nav.ts`). Đã có lần chuyển
mục Cài đặt ra khỏi mảng đó để đưa xuống cuối menu, và **cả 4 vai mất luôn trang Cài đặt** — vì
route biến mất theo. Muốn đổi thứ tự hiển thị thì tách `PRIMARY_NAV_ITEMS` / `BOTTOM_NAV_ITEMS`
rồi **nối lại** vào `NAV_ITEMS`.

Ẩn một mục khỏi menu ≠ xoá route. Ẩn thì chú thích dòng đó lại và ghi rõ vì sao.

### 3.2 Kiểu TypeScript của DTO là CHÉP TAY

Không có sinh code từ BE. Đổi DTO bên BE thì `src/types/*.ts` **không hề báo lỗi** — màn hình chỉ
lặng lẽ hiện `-` hoặc rỗng. Sửa BE là phải mở `types/` ra sửa theo. Đã dính thật vài lần
(`status` vs `isActive`, đơn vị/học vị nhận vào rồi vứt đi).

### 3.3 Ngày giờ

BE là PostgreSQL `timestamptz`, tất cả UTC. Ô `datetime-local` phải quy đổi bằng
`fromDateTimeLocalInput` / `toDateTimeLocalInput` trong `src/utils/format.ts` — **không** dùng
`.slice(0, 16)`.

Tiện thể, `format.ts` còn có `externalUrl()` (thêm `https://` khi link thiếu scheme — thiếu nó thì
nút "Vào họp" điều hướng vào đường dẫn tương đối) và `proposalTitle()` (ưu tiên tên tiếng Việt).

### 3.4 Thông báo lỗi từ máy chủ

`axiosClient.resolveMessage` cố ý **ưu tiên `message` cụ thể** của máy chủ hơn bản dịch theo mã,
vì mã của 400/409 chỉ là thùng chứa chung (`VALIDATION_FAILED`/`CONFLICT`). Câu máy chủ trả về
thường đã nêu luôn cách xử lý — nuốt nó rồi in câu chung chung là người dùng không biết làm gì tiếp.

---

## 4. Thế nào là "xong"

1. `npm run typecheck` sạch **và** `npm run build` xanh.

   > ⚠️ Phải dùng **`npm run typecheck`** (`tsc -p tsconfig.app.json`), **không** phải
   > `npx tsc --noEmit` — lệnh sau dùng tsconfig gốc và **bỏ sót lỗi trùng khoá i18n**
   > (`TS1117`). Đã dính thật: thêm một khoá đã tồn tại, `npx tsc` báo sạch, `npm run build` mới đỏ.

2. **vi/en cân bằng khoá** — thêm khoá thì thêm cả hai file. Trước khi thêm khoá mới, **grep xem
   nó đã tồn tại chưa**: nhiều khoá đã được khai sẵn nhưng component chưa dùng tới.
3. Chạy thử màn vừa sửa trên trình duyệt với BE thật, đừng chỉ tin build.
4. **KHÔNG tự commit** trừ khi chủ dự án yêu cầu trong đúng lượt đó.

---

## 5. Phong cách code

Codebase **chú thích bằng tiếng Việt**, và chú thích giải thích **vì sao** chứ không mô tả lại
code — nhiều chỗ ghi cả ngày tháng và lỗi cụ thể đã gặp. Giữ đúng phong cách đó. Chỗ nào không có
gì đáng giải thích thì để trống, đừng viết `// tăng biến đếm`.

Nghiệp vụ bám **QĐ 543/QĐ-ĐHFPT**. Quy tắc không suy ra được từ code nằm ở `CLAUDE.md` của repo BE
(24 quy tắc đánh số). **Đừng tự đoán luật** — đã có lần một quy tắc bị bịa ra rồi viện dẫn sai
điều khoản ngay trong thông báo lỗi hiện cho người dùng.

---

# AGENTS.md

# FURPMS Frontend Development Guide

Project Name:

FPT University Research Project Management System (FURPMS)

---

# Project Overview

FURPMS is a university-level research project management platform developed for FPT University.

The system manages the complete lifecycle of research projects:

- Research Cycle Management
- Research Proposal Submission
- Research Order Management
- Research Review Workflow
- Research Councils
- Reviewer Assignment
- Scoring & Evaluation
- Contract Management
- Deliverables
- Progress Reports
- Final Reports
- Notifications
- Analytics
- AI-powered Features

The frontend must be production-ready, scalable, maintainable, and suitable for a graduation capstone project.

---

# Core Business Roles

## Administrator

Responsibilities:

- Manage users
- Manage research cycles
- Manage research types
- Manage budget categories
- Manage financial configurations
- Manage organizational units
- Manage rubric criteria
- Upload applied research topics via Excel
- Monitor system analytics
- Manage permissions

---

## Staff

Responsibilities:

- Configure research cycles
- Configure research fields
- Create review councils
- Invite reviewers
- Create meetings
- Generate Google Meet links
- Manage review workflow
- Monitor proposal progress
- Manage research resources

---

## Principal Investigator (PI)

Responsibilities:

- Submit proposals
- Upload research files
- Manage project progress
- Submit reports
- Respond to reviewer feedback

---

## Review Committee

Responsibilities:

- Accept invitations
- Decline invitations
- Review proposals
- Score proposals
- Submit feedback
- Join meetings

---

# Research Types

The system supports two research types.

---

## Basic Research

Characteristics:

- PI uploads PDF or DOCX
- AI extracts information

Examples:

- Journal paper
- Conference paper
- Scientific publication

AI extracts:

- Title
- Abstract
- Keywords
- Research area

PI can edit extracted information before submission.

---

## Applied Research

Characteristics:

- Based on external research orders
- Topics imported by Admin

Examples:

- Build website
- Mobile application
- AI system
- IoT solution

Workflow:

1. PI selects topic
2. Upload proposal
3. AI compares uploaded document with topic

If similarity is low:

Display warning:

"The uploaded file does not appear to match the selected research topic. Do you want to continue submission?"

PI may still continue.

---

# Research Cycle

A research cycle contains:

- Submission period
- Review period
- Acceptance period

Statuses:

PLANNING

OPEN

CLOSED

Only OPEN cycles allow submissions.

---

# Research Fields

One cycle may contain multiple fields.

Examples:

- Information Technology
- Artificial Intelligence
- Data Science
- Business
- Economics
- Language
- Education

Fields are configured by Staff.

---

# Council Structure

Each council contains exactly:

1 Chairman

1 Secretary

2 Members

Total:

4 Members

Invitation statuses:

PENDING

ACCEPTED

DECLINED

---

# Meeting Management

Supported:

- Google Meet
- Microsoft Teams

Meeting contains:

- Agenda
- Date
- Time
- Participants
- Meeting Link

Staff manages meetings.

Reviewers can join meetings.

---

# Proposal Workflow

Proposal Statuses

DRAFT

SUBMITTED

UNDER_REVIEW

APPROVED

REJECTED

WITHDRAWN

Workflow:

DRAFT

↓

SUBMITTED

↓

UNDER_REVIEW

↓

APPROVED / REJECTED

---

# Review Workflow

Review Round Types

SCREENING

REVIEW

ACCEPTANCE

Decision Types

APPROVED

REJECTED

REVISION_REQUIRED

---

# Technical Stack

Frontend Stack:

- React 19
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- React Router v7
- TanStack Query
- Zustand
- Axios
- React Hook Form
- Zod
- Framer Motion
- Recharts
- Dayjs

Do not use Redux.

Do not use Context API for global business state.

Use Zustand.

---

# Design Philosophy

The application must not look AI-generated.

Visual references:

- Linear
- Stripe
- Vercel
- Notion
- Clerk
- Supabase

Characteristics:

- Premium
- Professional
- Modern
- Minimal
- Academic

Use whitespace properly.

Avoid excessive colors.

Avoid default shadcn appearance.

Customize components.

---

# Color System

Primary

#2563EB

Secondary

#0F172A

Accent

#14B8A6

Success

#22C55E

Warning

#F59E0B

Danger

#EF4444

Background

#F8FAFC

Card

#FFFFFF

Dark mode required.

---

# Animation Rules

Use Framer Motion.

Required:

- Page transitions
- Sidebar transitions
- Modal animations
- Card hover effects
- Table loading skeletons
- Animated counters
- Chart animations

Animation duration:

150ms–300ms

Avoid excessive motion.

---

# Folder Structure

src/

app/

router/

providers/

components/

ui/

layout/

shared/

features/

auth/

dashboard/

admin/

staff/

pi/

reviewer/

proposal/

research-cycle/

research-order/

council/

meeting/

review/

contract/

analytics/

notification/

ai/

services/

api/

hooks/

store/

types/

utils/

constants/

mock/

assets/

---

# API Layer Architecture

Use:

services/

Example:

auth.service.ts

proposal.service.ts

cycle.service.ts

council.service.ts

meeting.service.ts

notification.service.ts

analytics.service.ts

Never call axios directly inside components.

Always use service layer.

---

# Query Architecture

Use TanStack Query.

Create:

queryKeys.ts

Example:

queryKeys.proposals.list

queryKeys.proposals.detail

queryKeys.cycles.list

queryKeys.users.list

Do not hardcode query keys.

---

# Forms

Use:

React Hook Form

-

Zod

Requirements:

- Validation
- Error messages
- Loading states
- Disabled states

---

# Table Standards

All data tables must support:

- Sorting
- Filtering
- Pagination
- Search
- Column visibility
- Export

Use TanStack Table.

---

# Dashboard Standards

Every dashboard must include:

- KPI cards
- Charts
- Activity feed
- Quick actions

Charts:

- Area Chart
- Line Chart
- Bar Chart
- Pie Chart

Use Recharts.

---

# Mock Strategy

Backend currently lacks some endpoints.

Use MSW.

Feature flag:

USE_MOCK_API

Mock:

- Research Types
- AI Extraction
- AI Similarity Check
- AI Feedback
- AI Rubric Suggestions
- Research Topic Import
- Proposal Documents
- Realtime Notifications

Switching to real backend should only require changing service implementations.

No UI refactoring.

---

# Authentication

Backend:

JWT Bearer

Store token securely.

Create:

authStore

Functions:

login

logout

getCurrentUser

refreshProfile

Role-based route protection required.

---

# Error Handling

Every API request must support:

- Loading state
- Error state
- Retry state

Display user-friendly messages.

Never expose backend stack traces.

---

# Accessibility

Required:

- Keyboard navigation
- Screen reader labels
- Focus states
- Proper aria attributes

---

# Code Standards

Always use TypeScript.

Avoid any.

Prefer interfaces.

Prefer reusable components.

Avoid duplicated code.

Keep components small.

Extract business logic into hooks.

Use feature-based architecture.

---

# Performance Rules

Use:

React.lazy

Suspense

Code splitting

Memoization when necessary

Virtualized tables for large datasets

---

# Deliverable Goal

Build a production-quality SaaS platform that can be demonstrated to lecturers, supervisors, and thesis defense committees.

The system should feel like a real commercial research management platform rather than a student project.

Prioritize:

1. User Experience
2. Maintainability
3. Scalability
4. Clean Architecture
5. Business Workflow Accuracy
