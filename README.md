<div align="center">

# 🌿 TapHoa — Frontend

**Nền tảng thương mại điện tử nông sản tươi sạch**
Mô hình O2O: đặt hàng online, nhận hàng tại Hub gần nhất

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)

[Backend Repo](https://github.com/tennyhoang/TapHoa-BE) · [Báo lỗi](https://github.com/tennyhoang/TapHoa-FE/issues)

</div>

---

## Giới thiệu

TapHoa FE là giao diện người dùng của hệ thống bán lẻ nông sản tươi sạch theo mô hình **O2O (Online-to-Offline)**. Thay vì giao hàng tận nhà, người dùng chọn một **Hub** (điểm trung chuyển) gần nhất để nhận đơn — giúp tối ưu chi phí logistics và đảm bảo hàng tươi.

Ứng dụng được xây dựng trên **Next.js 15 App Router** với kiến trúc phân tầng rõ ràng: service layer cho API calls, Zustand cho client state, TanStack Query cho server state.

---

## Tech Stack

| Hạng mục | Công nghệ | Phiên bản |
|---|---|---|
| Framework | Next.js App Router | 16.x |
| Language | TypeScript | 5.x |
| UI Components | shadcn/ui + Radix UI | latest |
| Styling | Tailwind CSS | v4 |
| Icons | Lucide React | latest |
| Client State | Zustand | 5.x |
| Server State | TanStack Query | 5.x |
| HTTP Client | Axios | 1.x |
| Forms | React Hook Form | 7.x |
| Notifications | Sonner | 2.x |

---

## Tính năng chính

### Dành cho khách hàng
- **Xác thực** — Đăng ký / Đăng nhập với JWT. Axios interceptor tự đính kèm Bearer token và xử lý 401 tự động
- **Chọn Hub** — Dialog chọn điểm nhận hàng gần nhất. `hubId` lưu vào Zustand persist, sử dụng khi tạo đơn
- **Duyệt sản phẩm** — Lọc theo danh mục, sắp xếp theo giá/tên/mới nhất, query `isNew` và `isDiscount`
- **Giỏ hàng** — Quản lý server-side, đồng bộ real-time qua TanStack Query
- **Thanh toán** — Chọn COD hoặc Chuyển khoản. Trang success hiển thị mã đơn, thông tin CK MB Bank và nút sao chép
- **Theo dõi đơn** — Timeline hiển thị đầy đủ 7 trạng thái với timestamp từng bước
- **Hồ sơ** — Xem/cập nhật thông tin cá nhân, lịch sử đơn hàng, quản lý nhiều địa chỉ giao hàng

### Dành cho quản trị viên
- **Dashboard** — Tổng quan doanh thu, số đơn theo trạng thái
- **Quản lý đơn hàng** — Bảng đơn với bộ lọc trạng thái, tìm kiếm, expand xem chi tiết sản phẩm, thao tác xác nhận/hủy nhanh
- **Quản lý sản phẩm** — CRUD đầy đủ, upload ảnh, đặt giá khuyến mãi
- **Quản lý danh mục** — Tạo/sửa/xóa category
- **Quản lý người dùng** — Xem danh sách, filter theo role và trạng thái

---

## Kiến trúc Frontend

```
┌─────────────────────────────────────────────────────────┐
│                     Next.js App Router                  │
│                                                         │
│   Pages (app/)          Components        Stores        │
│   ├── /                 ├── layout/       ├── auth      │
│   ├── /products/[id]    ├── products/     └── hub       │
│   ├── /cart             ├── cart/                       │
│   ├── /checkout         ├── orders/       Services      │
│   ├── /profile          ├── hub/          ├── product   │
│   └── /admin            ├── admin/        ├── order     │
│                         └── ui/           ├── cart      │
│                                           ├── auth      │
│   TanStack Query ──────── Axios ──────── └── hub        │
│   (server state)      (interceptor)                     │
└─────────────────────────────────────────────────────────┘
                              │
                    REST API (localhost:5084)
```

---

## Luồng O2O

```
1. Khách chọn Hub gần nhất  →  hubId lưu vào Zustand
2. Duyệt & thêm vào giỏ     →  cart server-side
3. Checkout                  →  POST /orders { hubId, paymentMethod }
4. Backend trừ stock         →  Đơn tạo với status = Pending
5. Admin xác nhận & giao     →  Shipping → ArrivedAtHub
6. Khách nhận thông báo      →  Đến Hub lấy hàng → Delivered
```

---

## Cấu trúc thư mục

```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Admin sidebar layout
│   │   ├── page.tsx            # Dashboard tổng quan
│   │   ├── orders/page.tsx
│   │   ├── products/page.tsx
│   │   ├── categories/page.tsx
│   │   └── users/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/
│   │   ├── page.tsx            # Chọn Hub + thanh toán
│   │   └── success/page.tsx    # Xác nhận đơn + hướng dẫn CK
│   ├── products/[id]/page.tsx
│   └── profile/
│       ├── page.tsx
│       ├── orders/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       └── addresses/page.tsx
│
├── components/
│   ├── admin/orders/AdminOrderRow.tsx
│   ├── admin/products/ProductFormDialog.tsx
│   ├── cart/CartItem.tsx
│   ├── hub/HubPickerDialog.tsx
│   ├── layout/
│   │   ├── Header.tsx          # Sticky header + hub selector
│   │   └── Footer.tsx
│   ├── orders/
│   │   ├── OrderCard.tsx
│   │   ├── OrderStatusBadge.tsx
│   │   └── OrderStatusFilter.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   └── ProductImageGallery.tsx
│   └── ui/                     # shadcn/ui components
│
├── services/                   # Axios API calls, 1 file = 1 resource
│   ├── auth.service.ts
│   ├── product.service.ts
│   ├── order.service.ts
│   ├── cart.service.ts
│   ├── hub.service.ts
│   ├── address.service.ts
│   ├── category.service.ts
│   └── user.service.ts
│
├── store/
│   ├── auth.store.ts           # JWT token, user info, role
│   └── hub.store.ts            # Hub đang chọn (persist localStorage)
│
├── types/index.ts              # Shared TypeScript interfaces
└── lib/
    ├── api.ts                  # Axios instance + interceptors
    └── format.ts               # formatPrice, formatDate, status labels
```

---

## Cài đặt

### Yêu cầu

- Node.js 20+
- Backend [TapHoa-BE](https://github.com/tennyhoang/TapHoa-BE) đang chạy tại `http://localhost:5084`

### Các bước

```bash
# 1. Clone repo
git clone https://github.com/tennyhoang/TapHoa-FE.git
cd TapHoa-FE

# 2. Cài dependencies
npm install

# 3. Tạo file môi trường
cp .env.example .env.local
# Sửa NEXT_PUBLIC_API_URL nếu backend chạy cổng khác

# 4. Chạy development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

### Biến môi trường

| Biến | Mô tả | Mặc định |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL của REST API | `http://localhost:5084/api/v1` |

### Build production

```bash
npm run build
npm run start
```

---

## Tài khoản demo

| Role | Email | Password |
|---|---|---|
| Admin | *(tạo qua API)* | — |
| Agent | `agent.q1@taphoa.vn` | `TapHoa@2025` |
| Driver | `driver.tuan@taphoa.vn` | `TapHoa@2025` |
