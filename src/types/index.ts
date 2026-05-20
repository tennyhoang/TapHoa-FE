export interface LoginResponse {
  accessToken: string;
  email: string;
  fullName: string;
  role: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  children: Category[];
}

export interface ProductImage {
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  thumbnailUrl?: string;
  categoryId: string;
  categoryName: string;
  averageRating: number;
  reviewCount: number;
  soldCount?: number;
  images: string[];
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  thumbnailUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
}

export interface Address {
  id: string;
  receiverName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  thumbnailUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export enum OrderStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Shipping = 'Shipping',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export interface Order {
  id: string;
  userId: string;
  userFullName: string;
  status: OrderStatus;
  totalAmount: number;
  note?: string;
  receiverName: string;
  phoneNumber: string;
  shippingAddress: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilterParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface Review {
  id: string;
  userId: string;
  userFullName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
