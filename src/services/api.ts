import {
  StoreSettings,
  Category,
  Product,
  InventoryMovement,
  Customer,
  Order,
  DashboardMetrics,
  AnalyticsData,
  AppUser,
} from '../types.ts';

// Settings
export async function getStoreSettings(): Promise<StoreSettings> {
  const res = await fetch('/api/settings');
  if (!res.ok) throw new Error('Error al cargar la configuración');
  return res.json();
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al guardar la configuración');
  }
  return res.json();
}

// Categories
export async function getCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories');
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear la categoría');
  }
  return res.json();
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const res = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar la categoría');
  }
  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al eliminar la categoría');
  }
}

// Products
export async function getProducts(params?: {
  status?: string;
  categoryId?: number | string;
  search?: string;
}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.categoryId) query.append('categoryId', String(params.categoryId));
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`/api/products?${query.toString()}`);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
}

export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) throw new Error('Error al obtener el producto');
  return res.json();
}

export async function createProduct(data: Partial<Product> & { performedBy?: string }): Promise<Product> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al crear el producto');
  }
  return res.json();
}

export async function updateProduct(id: number, data: Partial<Product>): Promise<Product> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar el producto');
  }
  return res.json();
}

export async function deleteProduct(id: number): Promise<void> {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al eliminar el producto');
  }
}

// Inventory
export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  const res = await fetch('/api/inventory/movements');
  if (!res.ok) throw new Error('Error al cargar movimientos de inventario');
  return res.json();
}

export async function registerInventoryMovement(data: {
  productId: number;
  type: 'entry' | 'exit';
  quantity: number;
  reason: string;
  performedBy?: string;
}): Promise<{ movement: InventoryMovement; updatedStock: number }> {
  const res = await fetch('/api/inventory/movements', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al registrar el movimiento');
  }
  return res.json();
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  const res = await fetch('/api/customers');
  if (!res.ok) throw new Error('Error al cargar clientes');
  return res.json();
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al guardar cliente');
  }
  return res.json();
}

// Orders
export async function getOrders(): Promise<Order[]> {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error('Error al cargar pedidos');
  return res.json();
}

export async function getOrder(id: number): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error('Error al cargar el pedido');
  return res.json();
}

export async function createOrder(data: {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  customerCity?: string;
  paymentMethod: string;
  items: { productId: number; quantity: number }[];
  discount?: number;
  shippingCost?: number;
  notes?: string;
  paymentProofUrl?: string;
}): Promise<{ message: string; order: Order }> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al procesar el pedido');
  }
  return res.json();
}

export async function updateOrderStatus(
  id: number,
  status: string,
  notes?: string,
  paymentStatus?: string
): Promise<Order> {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes, paymentStatus }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Error al actualizar estado');
  }
  return res.json();
}

// Reports & Dashboard
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch('/api/reports/dashboard');
  if (!res.ok) throw new Error('Error al cargar dashboard');
  return res.json();
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const res = await fetch('/api/reports/analytics');
  if (!res.ok) throw new Error('Error al cargar analíticas');
  return res.json();
}

// AI Endpoints (Gemini)
export async function generateAiDescription(params: {
  name: string;
  category: string;
  highlights: string;
}): Promise<{ description: string; bulletPoints: string[]; suggestedTags: string[] }> {
  const res = await fetch('/api/ai/description', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Error al generar descripción con IA');
  return res.json();
}

export async function recommendAiPrice(params: {
  name: string;
  category: string;
  costOrBasePrice?: number;
}): Promise<{
  suggestedRegularPrice: number;
  suggestedOfferPrice: number;
  strategyRationale: string;
  profitMarginPercent: number;
}> {
  const res = await fetch('/api/ai/recommend-price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Error al calcular precio con IA');
  return res.json();
}

export async function analyzeAiTrends(): Promise<{
  executiveSummary: string;
  topTrends: string[];
  restockAlerts: string[];
  marketingRecommendations: string[];
}> {
  const res = await fetch('/api/ai/trends', { method: 'POST' });
  if (!res.ok) throw new Error('Error al analizar tendencias con IA');
  return res.json();
}

export async function suggestAiRelatedProducts(productId: number): Promise<{
  relatedProducts: Product[];
  tip: string;
}> {
  const res = await fetch('/api/ai/suggest-related', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('Error al sugerir productos con IA');
  return res.json();
}

// Auth sync
export async function syncUserWithDb(userData: {
  uid: string;
  email: string;
  displayName?: string;
}): Promise<AppUser> {
  const res = await fetch('/api/auth/sync-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Error al sincronizar usuario');
  return res.json();
}
