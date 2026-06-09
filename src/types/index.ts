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

export interface OrderHubInfo {
  id: string;
  name: string;
  address: string;
  ward: string;
  district: string;
  city: string;
}

export enum OrderStatus {
  PendingPayment = 'PendingPayment',
  Paid_WaitingForBatch = 'Paid_WaitingForBatch',
  PackedAtWarehouse = 'PackedAtWarehouse',
  ShippingToHub = 'ShippingToHub',
  InHub_ReadyForPickup = 'InHub_ReadyForPickup',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
}

export interface Order {
  id: string;
  userId?: string;
  userFullName?: string;
  customerEmail?: string;
  status: OrderStatus;
  totalAmount: number;
  walletAmountUsed?: number;
  note?: string;
  paymentRef?: string;
  paidAt?: string;
  hub: OrderHubInfo;
  items: OrderItem[];
  createdAt: string;
  cancelReason?: string;
  shippingToHubAt?: string;
  inHubAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  deliveryPhotoUrl?: string;
}

export interface OrderFilterParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortByAmount?: 'asc' | 'desc';
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface DriverHubBatch {
  hubId: string;
  hubName: string;
  hubFullAddress: string;
  orderCount: number;
  totalAmount: number;
  orders: Order[];
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  agentHubId?: string;
  createdAt: string;
  warehouseId?: string;
  warehouseName?: string;
  managedWarehouseId?: string;
  managedWarehouseName?: string;
}

export interface Review {
  id: string;
  userId: string;
  userFullName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  sentiment: string;
}

export type ClaimType =
  | 'DamagedProduct'
  | 'WrongProduct'
  | 'MissingProduct'
  | 'LateDelivery'
  | 'Other';

export type ClaimStatus = 'Pending' | 'UnderReview' | 'Resolved' | 'Rejected';

export interface Claim {
  id: string;
  orderId: string;
  type: ClaimType;
  description: string;
  status: ClaimStatus;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface VoucherResponse {
  code: string;
  discountType: 'Percent' | 'Flat';
  discountValue: number;
  label: string;
}

export interface WarehouseDashboardInfo {
  id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  isActive: boolean;
}

export interface WarehouseDashboard {
  warehouse: WarehouseDashboardInfo | null;
  pendingOrders: number;
  packedOrders: number;
  shippingOrders: number;
  packedToday: number;
  activeDrivers: number;
  lowStockProducts: number;
}

export interface WarehouseOrderItem {
  productId: string;
  name: string;
  thumbnailUrl?: string;
  quantity: number;
  unitPrice: number;
}

export interface WarehouseOrder {
  id: string;
  status: 'Paid_WaitingForBatch' | 'PackedAtWarehouse' | 'ShippingToHub';
  totalAmount: number;
  createdAt: string;
  paidAt?: string;
  packedAtWarehouseAt?: string;
  note?: string;
  hub: { id: string; name: string; address: string };
  customer: { fullName: string; phoneNumber?: string };
  items: WarehouseOrderItem[];
}

export interface WarehouseInventoryItem {
  id: string;
  name: string;
  thumbnailUrl?: string;
  stock: number;
  price: number;
  categoryName: string;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface WarehouseDriver {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  isActive: boolean;
  activeOrders: number;
}
