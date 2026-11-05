export interface StoreSettings {
  id: number;
  storeName: string;
  logoUrl?: string;
  description?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  bankDetails?: string;
  nequiNumber?: string;
  daviplataNumber?: string;
  lowStockThreshold: number;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  categoryId?: number | null;
  categoryName?: string | null;
  price: number;
  offerPrice?: number | null;
  stock: number;
  mainImage?: string;
  gallery?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryMovement {
  id: number;
  productId: number;
  productCode?: string;
  productName?: string;
  productImage?: string;
  type: 'entry' | 'exit';
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
  performedBy?: string;
  createdAt?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  notes?: string;
  createdAt?: string;
  orderCount?: number;
  totalSpent?: number;
}

export type OrderStatus = 'received' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'transfer' | 'nequi' | 'daviplata' | 'cash_on_delivery' | 'card';
export type PaymentStatus = 'pending' | 'verified' | 'failed';

export interface OrderItem {
  id?: number;
  orderId?: number;
  productId: number;
  productCode: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId?: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  customerCity?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentProofUrl?: string;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DashboardMetrics {
  todaySales: number;
  todayOrdersCount: number;
  totalRevenue: number;
  pendingOrdersCount: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalCustomers: number;
  totalProducts: number;
  totalInventoryValue: number;
  totalStockUnits: number;
  recentOrders: Order[];
  alertProducts: Product[];
}

export interface AnalyticsData {
  dailySales: { date: string; total: number; count: number }[];
  topProducts: {
    name: string;
    code: string;
    units: number;
    revenue: number;
    image: string;
  }[];
  paymentStats: { method: string; total: number; count: number }[];
  categoryCount: number;
  productCount: number;
}

export interface AppUser {
  id?: number;
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'client';
}
