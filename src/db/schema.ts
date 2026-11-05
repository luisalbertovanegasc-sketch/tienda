import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Configuración general de la tienda
export const storeSettings = pgTable('store_settings', {
  id: serial('id').primaryKey(),
  storeName: text('store_name').notNull().default('Tienda en Línea Fénix'),
  logoUrl: text('logo_url').default(''),
  description: text('description').default(''),
  address: text('address').default(''),
  phone: text('phone').default(''),
  whatsapp: text('whatsapp').default(''),
  email: text('email').default(''),
  facebook: text('facebook').default(''),
  instagram: text('instagram').default(''),
  tiktok: text('tiktok').default(''),
  bankDetails: text('bank_details').default(''),
  nequiNumber: text('nequi_number').default(''),
  daviplataNumber: text('daviplata_number').default(''),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Usuarios (administradores y clientes) vinculados con Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').notNull().default('client'), // 'admin' | 'client'
  displayName: text('display_name').default(''),
  phone: text('phone').default(''),
  address: text('address').default(''),
  city: text('city').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categorías de productos
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').default(''),
  imageUrl: text('image_url').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Productos del catálogo
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(), // SKU / Código único
  name: text('name').notNull(),
  description: text('description').default(''),
  categoryId: integer('category_id').references(() => categories.id),
  price: integer('price').notNull(), // Precio normal en moneda local
  offerPrice: integer('offer_price'), // Precio promocional opcional
  stock: integer('stock').notNull().default(0),
  mainImage: text('main_image').default(''),
  gallery: text('gallery').default('[]'), // Array JSON serializado
  status: text('status').notNull().default('active'), // 'active' | 'inactive'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Historial y control de movimientos de inventario
export const inventoryMovements = pgTable('inventory_movements', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  type: text('type').notNull(), // 'entry' (entrada) | 'exit' (salida)
  quantity: integer('quantity').notNull(),
  reason: text('reason').notNull(), // 'Compra a proveedor', 'Venta', 'Ajuste manual', 'Merma', 'Devolución'
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  performedBy: text('performed_by').default('Administrador'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Clientes registrados
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').default(''),
  address: text('address').default(''),
  city: text('city').default(''),
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// Pedidos realizados
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').default(''),
  customerAddress: text('customer_address').notNull(),
  customerCity: text('customer_city').default(''),
  paymentMethod: text('payment_method').notNull(), // 'transfer', 'nequi', 'daviplata', 'cash_on_delivery', 'card'
  paymentStatus: text('payment_status').notNull().default('pending'), // 'pending', 'verified', 'failed'
  paymentProofUrl: text('payment_proof_url').default(''),
  subtotal: integer('subtotal').notNull(),
  discount: integer('discount').notNull().default(0),
  shippingCost: integer('shipping_cost').notNull().default(0),
  total: integer('total').notNull(),
  status: text('status').notNull().default('received'), // 'received', 'preparing', 'shipped', 'delivered', 'cancelled'
  notes: text('notes').default(''),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Detalle de ítems por pedido
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id),
  productCode: text('product_code').notNull(),
  productName: text('product_name').notNull(),
  productImage: text('product_image').default(''),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  subtotal: integer('subtotal').notNull(),
});

// Relaciones Drizzle
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  inventoryMovements: many(inventoryMovements),
  orderItems: many(orderItems),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  product: one(products, {
    fields: [inventoryMovements.productId],
    references: [products.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
