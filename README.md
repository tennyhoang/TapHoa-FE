<div align="center">

# TapHoa — Frontend

**Nền tảng tạp hóa & thực phẩm tươi nội thành TP.HCM**
Mô hình O2O: đặt hàng online, nhận hàng tại Hub gần nhất

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)

[Backend Repo](https://github.com/tennyhoang/TapHoa-BE) · [Báo lỗi](https://github.com/tennyhoang/TapHoa-FE/issues)

</div>

---

## Giới thiệu

TapHoa FE là giao diện người dùng của hệ thống bán lẻ tạp hóa tươi sạch theo mô hình **O2O (Online-to-Offline)**. Thay vì giao tận nhà, người dùng chọn một **Hub** gần nhất để nhận đơn — tối ưu logistics, đảm bảo hàng tươi.

Xây dựng trên **Next.js 16 App Router** với i18n (vi/en), service layer cho API calls, Zustand cho client state, TanStack Query cho server state, và SignalR cho real-time notifications.

---

## Tech Stack

| Hạng mục      | Công nghệ                    | Phiên bản |
| ------------- | ---------------------------- | --------- |
| Framework     | Next.js App Router           | 16.x      |
| Language      | TypeScript                   | 5.x       |
| UI Components | shadcn/ui + Radix UI         | latest    |
| Styling       | Tailwind CSS                 | v4        |
| Icons         | Lucide React                 | latest    |
| i18n          | next-intl                    | 4.x       |
| Client State  | Zustand                      | 5.x       |
| Server State  | TanStack Query               | 5.x       |
| HTTP Client   | Axios                        | 1.x       |
| Real-time     | SignalR (@microsoft/signalr) | 10.x      |
| Forms         | React Hook Form              | 7.x       |
| Notifications | Sonner                       | 2.x       |
| Map           | Leaflet + React Leaflet      | latest    |
| Monitoring    | Sentry                       | 10.x      |

---

## Tính năng

### Khách hàng

- **Xác thực** — Đăng ký / đăng nhập JWT, Google OAuth, inactivity auto-logout
- **Chọn Hub** — Dialog chọn điểm nhận hàng, sort theo khoảng cách GPS
- **Duyệt sản phẩm** — Lọc danh mục, sắp xếp, tìm kiếm live autocomplete
- **Giỏ hàng** — Server-side, optimistic update, sync real-time
- **Thanh toán** — COD hoặc chuyển khoản, dùng ví một phần
- **Theo dõi đơn** — Timeline 7 trạng thái, real-time update qua SignalR
- **Hồ sơ** — Thông tin, địa chỉ, lịch sử đơn, ví điện tử, khiếu nại
- **Flash Sale** — Countdown timer, progress bar tồn kho
- **Cẩm nang** — Blog thực phẩm, AI-generated content

### Admin Portal (`/admin`)

- Dashboard doanh thu, đơn hàng real-time (SignalR)
- CRUD sản phẩm, danh mục, người dùng, hub, kho
- Quản lý flash sale, bài viết, voucher
- Xét duyệt khiếu nại và rút tiền ví

### Warehouse Portal (`/warehouse`)

- Dashboard tồn kho, đơn chờ đóng gói
- Cập nhật trạng thái đóng gói theo batch

### Driver Portal (`/driver`)

- Nhận batch đơn theo hub, xác nhận giao
- Tối ưu lộ trình

### Hub Agent Portal (`/agent`)

- Xác nhận hàng đến hub, xác nhận khách nhận

---

## Kiến trúc

```
src/
├── app/
│   └── [locale]/               # i18n routing (vi / en)
│       ├── page.tsx            # Landing page
│       ├── products/
│       │   ├── page.tsx        # Danh sách sản phẩm
│       │   └── [id]/page.tsx   # Chi tiết sản phẩm
│       ├── cart/page.tsx
│       ├── checkout/
│       │   ├── page.tsx
│       │   └── success/page.tsx
│       ├── profile/
│       │   ├── page.tsx
│       │   ├── orders/[id]/page.tsx
│       │   ├── addresses/page.tsx
│       │   ├── wallet/page.tsx
│       │   └── notifications/page.tsx
│       ├── flash-sale/page.tsx
│       ├── cam-nang/page.tsx
│       ├── admin/
│       ├── warehouse/
│       ├── driver/
│       └── agent/
│
├── components/
│   ├── landing/                # Hero, Category, FlashSale, Blog...
│   ├── layout/                 # Header, Footer, SearchBar
│   ├── products/               # ProductCard, ProductImageGallery
│   ├── cart/                   # CartItem, VoucherInput
│   ├── orders/                 # OrderCard, OrderStatusBadge
│   ├── admin/ warehouse/ driver/ hub/
│   └── ui/                     # shadcn/ui components
│
├── services/                   # Axios API calls — 1 file = 1 resource
├── store/                      # Zustand (auth, hub)
├── hooks/                      # useOrderStatusSocket, useDebounce...
├── types/index.ts
└── lib/
    ├── api.ts                  # Axios instance + interceptors
    └── format.ts
```

---

## Luồng O2O

```
1. Chọn Hub gần nhất    →  hubId lưu vào Zustand
2. Duyệt & thêm giỏ    →  cart server-side
3. Checkout             →  POST /orders { hubId, paymentMethod }
4. Backend trừ stock    →  status = PendingPayment
5. Thanh toán xác nhận →  Paid_WaitingForBatch
6. Kho đóng gói        →  PackedAtWarehouse
7. Driver giao Hub      →  ShippingToHub
8. Khách nhận tại Hub   →  InHub_ReadyForPickup → Completed
```

---

## Cài đặt

**Yêu cầu:** Node.js 20+, Backend TapHoa-BE đang chạy

```bash
git clone https://github.com/tennyhoang/TapHoa-FE.git
cd TapHoa-FE
npm install
cp .env.example .env.local
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

### Biến môi trường

| Biến                               | Mô tả                  |
| ---------------------------------- | ---------------------- |
| `NEXT_PUBLIC_API_URL`              | Base URL REST API      |
| `NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth Client ID |

---

## Tài khoản demo

| Role     | Email                   | Password      |
| -------- | ----------------------- | ------------- |
| Admin    | `admin@taphoa.com`      | `TapHoa@2025` |
| Agent    | `agent.q1@taphoa.vn`    | `TapHoa@2025` |
| Driver   | `driver.tuan@taphoa.vn` | `TapHoa@2025` |
| Customer | `customer@taphoa.vn`    | `TapHoa@2025` |
