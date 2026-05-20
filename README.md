# TapHoa FE

Frontend của nền tảng thương mại điện tử nông sản tươi sạch **TapHoa**, theo mô hình **O2O (Online-to-Offline)**: khách hàng đặt hàng online và đến điểm Hub gần nhất để nhận hàng.

> **Backend repo:** [TapHoa-BE](https://github.com/tennyhoang/TapHoa-BE)

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State management | Zustand (auth, hub selection) |
| Server state | TanStack Query v5 |
| HTTP client | Axios + JWT interceptor |
| Notifications | Sonner |

---

## Tính năng

- **Xác thực** — Đăng ký / Đăng nhập JWT, tự động đính kèm Bearer token
- **Chọn Hub** — Chọn điểm nhận hàng gần nhất; `hubId` lưu vào Zustand dùng lúc checkout
- **Danh mục sản phẩm** — Lọc theo category, sắp xếp, `isNew` (hàng mới), `isDiscount` (khuyến mãi)
- **Giỏ hàng** — Quản lý server-side với TanStack Query
- **Thanh toán** — COD hoặc chuyển khoản ngân hàng; trang success với hướng dẫn CK
- **Theo dõi đơn hàng** — Timeline trạng thái đầy đủ
- **Hồ sơ** — Lịch sử đơn hàng, sổ địa chỉ
- **Admin** — Quản lý đơn hàng, sản phẩm, danh mục, người dùng

---

## Cấu trúc thư mục

```
src/
├── app/                  # Next.js App Router pages
│   ├── admin/            # Trang quản trị
│   ├── auth/             # Đăng nhập / Đăng ký
│   ├── cart/
│   ├── checkout/
│   ├── products/[id]/
│   └── profile/
├── components/
│   ├── admin/
│   ├── cart/
│   ├── hub/              # HubPickerDialog
│   ├── layout/           # Header, Footer
│   ├── orders/
│   ├── products/
│   └── ui/               # shadcn/ui components
├── services/             # Axios API calls
├── store/                # Zustand stores (auth, hub)
├── types/                # TypeScript types dùng chung
└── lib/                  # Axios instance, format helpers
```

---

## Cài đặt & Chạy

### Yêu cầu
- Node.js 20+
- Backend đang chạy tại `http://localhost:5084`

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

### Biến môi trường

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5084/api/v1
```
