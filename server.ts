import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { eq, desc, sql, and, or, inArray } from 'drizzle-orm';
import { db } from './src/db/index.ts';
import {
  storeSettings,
  users,
  categories,
  products,
  inventoryMovements,
  customers,
  orders,
  orderItems,
} from './src/db/schema.ts';
import {
  generateProductDescription,
  recommendProductPrice,
  analyzeShoppingTrends,
  suggestRelatedProducts,
} from './src/lib/gemini.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Helper para obtener o inicializar configuración de la tienda
async function getOrInitSettings() {
  try {
    const list = await db.select().from(storeSettings).limit(1);
    if (list.length > 0) {
      return list[0];
    }
    const inserted = await db
      .insert(storeSettings)
      .values({
        storeName: 'Tienda en Línea Fénix',
        description: '',
        address: '',
        phone: '',
        whatsapp: '',
        email: '',
        lowStockThreshold: 5,
      })
      .returning();
    return inserted[0];
  } catch (err) {
    console.error('Error fetching/init store settings:', err);
    throw new Error('No se pudo cargar la configuración de la tienda', { cause: err });
  }
}

// ==========================================
// 1. CONFIGURACIÓN DE LA TIENDA
// ==========================================
app.get('/api/settings', async (_req: Request, res: Response) => {
  try {
    const settings = await getOrInitSettings();
    res.json(settings);
  } catch (error: any) {
    console.error('Error in GET /api/settings:', error);
    res.status(500).json({ error: error.message || 'Error del servidor' });
  }
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    const current = await getOrInitSettings();
    const {
      storeName,
      logoUrl,
      description,
      address,
      phone,
      whatsapp,
      email,
      facebook,
      instagram,
      tiktok,
      bankDetails,
      nequiNumber,
      daviplataNumber,
      lowStockThreshold,
    } = req.body;

    const updated = await db
      .update(storeSettings)
      .set({
        storeName: storeName || 'Tienda en Línea Fénix',
        logoUrl: logoUrl ?? current.logoUrl,
        description: description ?? current.description,
        address: address ?? current.address,
        phone: phone ?? current.phone,
        whatsapp: whatsapp ?? current.whatsapp,
        email: email ?? current.email,
        facebook: facebook ?? current.facebook,
        instagram: instagram ?? current.instagram,
        tiktok: tiktok ?? current.tiktok,
        bankDetails: bankDetails ?? current.bankDetails,
        nequiNumber: nequiNumber ?? current.nequiNumber,
        daviplataNumber: daviplataNumber ?? current.daviplataNumber,
        lowStockThreshold: Number(lowStockThreshold) || 5,
        updatedAt: new Date(),
      })
      .where(eq(storeSettings.id, current.id))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error in PUT /api/settings:', error);
    res.status(500).json({ error: error.message || 'Error al actualizar configuración' });
  }
});

// ==========================================
// 2. GESTIÓN DE CATEGORÍAS
// ==========================================
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const allCategories = await db.select().from(categories).orderBy(desc(categories.createdAt));
    res.json(allCategories);
  } catch (error: any) {
    console.error('Error in GET /api/categories:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const { name, description, imageUrl } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    const inserted = await db
      .insert(categories)
      .values({
        name: name.trim(),
        description: description?.trim() || '',
        imageUrl: imageUrl?.trim() || '',
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Error in POST /api/categories:', error);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
});

app.put('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, imageUrl } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    const updated = await db
      .update(categories)
      .set({
        name: name.trim(),
        description: description?.trim() || '',
        imageUrl: imageUrl?.trim() || '',
      })
      .where(eq(categories.id, id))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error in PUT /api/categories/:id:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    // Desvincular productos de esta categoría
    await db.update(products).set({ categoryId: null }).where(eq(products.categoryId, id));
    const deleted = await db.delete(categories).where(eq(categories.id, id)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada con éxito' });
  } catch (error: any) {
    console.error('Error in DELETE /api/categories/:id:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// ==========================================
// 3. GESTIÓN DE PRODUCTOS
// ==========================================
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { status, categoryId, search } = req.query;

    const allProducts = await db
      .select({
        id: products.id,
        code: products.code,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        price: products.price,
        offerPrice: products.offerPrice,
        stock: products.stock,
        mainImage: products.mainImage,
        gallery: products.gallery,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt));

    let filtered = allProducts;
    if (status && typeof status === 'string' && status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }
    if (categoryId && typeof categoryId === 'string' && categoryId !== 'all') {
      const catId = Number(categoryId);
      filtered = filtered.filter(p => p.categoryId === catId);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
      const query = search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    res.json(filtered);
  } catch (error: any) {
    console.error('Error in GET /api/products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await db
      .select({
        id: products.id,
        code: products.code,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        price: products.price,
        offerPrice: products.offerPrice,
        stock: products.stock,
        mainImage: products.mainImage,
        gallery: products.gallery,
        status: products.status,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (result.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result[0]);
  } catch (error: any) {
    console.error('Error in GET /api/products/:id:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const {
      code,
      name,
      description,
      categoryId,
      price,
      offerPrice,
      stock,
      mainImage,
      gallery,
      status,
      performedBy,
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'El código del producto es obligatorio' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
    }
    if (price === undefined || Number(price) < 0) {
      return res.status(400).json({ error: 'El precio debe ser un número válido mayor o igual a 0' });
    }

    // Verificar si el código ya existe
    const existing = await db.select().from(products).where(eq(products.code, code.trim())).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: `El código "${code.trim()}" ya está registrado para otro producto` });
    }

    const initialStock = Number(stock) || 0;
    const inserted = await db
      .insert(products)
      .values({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description?.trim() || '',
        categoryId: categoryId ? Number(categoryId) : null,
        price: Math.round(Number(price)),
        offerPrice: offerPrice ? Math.round(Number(offerPrice)) : null,
        stock: initialStock,
        mainImage: mainImage?.trim() || '',
        gallery: typeof gallery === 'string' ? gallery : JSON.stringify(gallery || []),
        status: status === 'inactive' ? 'inactive' : 'active',
      })
      .returning();

    const newProduct = inserted[0];

    // Si tiene stock inicial, registrar movimiento de inventario
    if (initialStock > 0) {
      await db.insert(inventoryMovements).values({
        productId: newProduct.id,
        type: 'entry',
        quantity: initialStock,
        reason: 'Inventario inicial al crear producto',
        previousStock: 0,
        newStock: initialStock,
        performedBy: performedBy || 'Administrador',
      });
    }

    res.status(201).json(newProduct);
  } catch (error: any) {
    console.error('Error in POST /api/products:', error);
    res.status(500).json({ error: error.message || 'Error al crear producto' });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {
      code,
      name,
      description,
      categoryId,
      price,
      offerPrice,
      mainImage,
      gallery,
      status,
    } = req.body;

    const currentList = await db.select().from(products).where(eq(products.id, id));
    if (currentList.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const current = currentList[0];

    // Si cambió el código, verificar que no esté ocupado
    if (code && code.trim().toUpperCase() !== current.code) {
      const existing = await db
        .select()
        .from(products)
        .where(eq(products.code, code.trim().toUpperCase()))
        .limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: `El código "${code.trim()}" ya pertenece a otro producto` });
      }
    }

    const updated = await db
      .update(products)
      .set({
        code: code ? code.trim().toUpperCase() : current.code,
        name: name ? name.trim() : current.name,
        description: description !== undefined ? description.trim() : current.description,
        categoryId: categoryId !== undefined ? (categoryId ? Number(categoryId) : null) : current.categoryId,
        price: price !== undefined ? Math.round(Number(price)) : current.price,
        offerPrice: offerPrice !== undefined ? (offerPrice ? Math.round(Number(offerPrice)) : null) : current.offerPrice,
        mainImage: mainImage !== undefined ? mainImage.trim() : current.mainImage,
        gallery: gallery !== undefined ? (typeof gallery === 'string' ? gallery : JSON.stringify(gallery)) : current.gallery,
        status: status || current.status,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error in PUT /api/products/:id:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    // Eliminar movimientos asociados
    await db.delete(inventoryMovements).where(eq(inventoryMovements.productId, id));
    const deleted = await db.delete(products).where(eq(products.id, id)).returning();
    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error in DELETE /api/products/:id:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ==========================================
// 4. INVENTARIO & MOVIMIENTOS
// ==========================================
app.get('/api/inventory/movements', async (_req: Request, res: Response) => {
  try {
    const list = await db
      .select({
        id: inventoryMovements.id,
        productId: inventoryMovements.productId,
        type: inventoryMovements.type,
        quantity: inventoryMovements.quantity,
        reason: inventoryMovements.reason,
        previousStock: inventoryMovements.previousStock,
        newStock: inventoryMovements.newStock,
        performedBy: inventoryMovements.performedBy,
        createdAt: inventoryMovements.createdAt,
        productCode: products.code,
        productName: products.name,
        productImage: products.mainImage,
      })
      .from(inventoryMovements)
      .leftJoin(products, eq(inventoryMovements.productId, products.id))
      .orderBy(desc(inventoryMovements.createdAt))
      .limit(100);

    res.json(list);
  } catch (error: any) {
    console.error('Error in GET /api/inventory/movements:', error);
    res.status(500).json({ error: 'Error al obtener movimientos de inventario' });
  }
});

app.post('/api/inventory/movements', async (req: Request, res: Response) => {
  try {
    const { productId, type, quantity, reason, performedBy } = req.body;
    const pId = Number(productId);
    const qty = Number(quantity);

    if (!pId || !qty || qty <= 0) {
      return res.status(400).json({ error: 'Producto y cantidad válida son requeridos' });
    }
    if (type !== 'entry' && type !== 'exit') {
      return res.status(400).json({ error: 'Tipo de movimiento inválido (debe ser "entry" o "exit")' });
    }

    const prodList = await db.select().from(products).where(eq(products.id, pId));
    if (prodList.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const product = prodList[0];
    const previousStock = product.stock;
    let newStock = previousStock;

    if (type === 'entry') {
      newStock = previousStock + qty;
    } else {
      if (previousStock < qty) {
        return res.status(400).json({
          error: `Stock insuficiente. Disponible actual: ${previousStock}, intento de salida: ${qty}`,
        });
      }
      newStock = previousStock - qty;
    }

    // Actualizar stock del producto
    await db
      .update(products)
      .set({ stock: newStock, updatedAt: new Date() })
      .where(eq(products.id, pId));

    // Registrar movimiento
    const movement = await db
      .insert(inventoryMovements)
      .values({
        productId: pId,
        type,
        quantity: qty,
        reason: reason?.trim() || (type === 'entry' ? 'Entrada manual' : 'Salida manual'),
        previousStock,
        newStock,
        performedBy: performedBy || 'Administrador',
      })
      .returning();

    res.status(201).json({
      movement: movement[0],
      updatedStock: newStock,
    });
  } catch (error: any) {
    console.error('Error in POST /api/inventory/movements:', error);
    res.status(500).json({ error: 'Error al registrar movimiento' });
  }
});

// ==========================================
// 5. CLIENTES
// ==========================================
app.get('/api/customers', async (_req: Request, res: Response) => {
  try {
    const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));

    // Calcular totales de compras por cliente
    const allOrders = await db.select().from(orders);
    const customerStats = allCustomers.map(c => {
      const userOrders = allOrders.filter(o => o.customerId === c.id);
      const totalSpent = userOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);
      return {
        ...c,
        orderCount: userOrders.length,
        totalSpent,
      };
    });

    res.json(customerStats);
  } catch (error: any) {
    console.error('Error in GET /api/customers:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

app.post('/api/customers', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, city, notes } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y correo electrónico son requeridos' });
    }

    const inserted = await db
      .insert(customers)
      .values({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || '',
        address: address?.trim() || '',
        city: city?.trim() || '',
        notes: notes?.trim() || '',
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    console.error('Error in POST /api/customers:', error);
    res.status(500).json({ error: 'Error al registrar cliente' });
  }
});

// ==========================================
// 6 & 7. PEDIDOS & CARRITO (CHECKOUT)
// ==========================================
app.get('/api/orders', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const items = await db.select().from(orderItems);

    const ordersWithItems = list.map(order => ({
      ...order,
      items: items.filter(it => it.orderId === order.id),
    }));

    res.json(ordersWithItems);
  } catch (error: any) {
    console.error('Error in GET /api/orders:', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

app.get('/api/orders/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const orderList = await db.select().from(orders).where(eq(orders.id, id));
    if (orderList.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const order = orderList[0];
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

    res.json({ ...order, items });
  } catch (error: any) {
    console.error('Error in GET /api/orders/:id:', error);
    res.status(500).json({ error: 'Error al obtener pedido' });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      paymentMethod,
      items,
      discount = 0,
      shippingCost = 0,
      notes = '',
      paymentProofUrl = '',
    } = req.body;

    if (!customerName || !customerEmail || !customerAddress) {
      return res.status(400).json({ error: 'Faltan datos de envío o del cliente' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito no contiene productos' });
    }

    // 1. Verificar existencia y stock disponible de todos los productos
    const productIds = items.map((it: any) => Number(it.productId)).filter(Boolean);
    const dbProds = await db.select().from(products).where(inArray(products.id, productIds));
    const prodMap = new Map(dbProds.map(p => [p.id, p]));

    for (const item of items) {
      const p = prodMap.get(Number(item.productId));
      if (!p) {
        return res.status(400).json({ error: `Producto con ID ${item.productId} no encontrado` });
      }
      if (p.status !== 'active') {
        return res.status(400).json({ error: `El producto "${p.name}" no está disponible para la venta` });
      }
      if (p.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para "${p.name}". Disponible: ${p.stock}, Solicitado: ${item.quantity}`,
        });
      }
    }

    // 2. Crear o buscar cliente
    let customerId: number | null = null;
    const existingCust = await db
      .select()
      .from(customers)
      .where(eq(customers.email, customerEmail.trim().toLowerCase()))
      .limit(1);

    if (existingCust.length > 0) {
      customerId = existingCust[0].id;
      // Actualizar datos si cambiaron
      await db
        .update(customers)
        .set({
          name: customerName.trim(),
          phone: customerPhone?.trim() || existingCust[0].phone,
          address: customerAddress.trim(),
          city: customerCity?.trim() || existingCust[0].city,
        })
        .where(eq(customers.id, customerId));
    } else {
      const newCust = await db
        .insert(customers)
        .values({
          name: customerName.trim(),
          email: customerEmail.trim().toLowerCase(),
          phone: customerPhone?.trim() || '',
          address: customerAddress.trim(),
          city: customerCity?.trim() || '',
        })
        .returning();
      customerId = newCust[0].id;
    }

    // 3. Calcular montos
    let subtotal = 0;
    const orderItemsToInsert: any[] = [];

    for (const it of items) {
      const p = prodMap.get(Number(it.productId))!;
      const unitPrice = p.offerPrice && p.offerPrice > 0 ? p.offerPrice : p.price;
      const lineSubtotal = unitPrice * it.quantity;
      subtotal += lineSubtotal;

      orderItemsToInsert.push({
        productId: p.id,
        productCode: p.code,
        productName: p.name,
        productImage: p.mainImage,
        quantity: it.quantity,
        unitPrice,
        subtotal: lineSubtotal,
      });
    }

    const calculatedDiscount = Math.min(subtotal, Math.max(0, Number(discount) || 0));
    const calculatedShipping = Math.max(0, Number(shippingCost) || 0);
    const total = Math.max(0, subtotal - calculatedDiscount + calculatedShipping);

    // 4. Generar número de orden único
    const orderNumber = `FNX-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 5. Insertar Pedido
    const insertedOrder = await db
      .insert(orders)
      .values({
        orderNumber,
        customerId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        customerPhone: customerPhone?.trim() || '',
        customerAddress: customerAddress.trim(),
        customerCity: customerCity?.trim() || '',
        paymentMethod,
        paymentStatus: paymentMethod === 'card' ? 'verified' : 'pending',
        paymentProofUrl: paymentProofUrl?.trim() || '',
        subtotal,
        discount: calculatedDiscount,
        shippingCost: calculatedShipping,
        total,
        status: 'received',
        notes: notes?.trim() || '',
      })
      .returning();

    const createdOrder = insertedOrder[0];

    // 6. Insertar ítems y descontar inventario con movimiento registrado
    for (const it of orderItemsToInsert) {
      await db.insert(orderItems).values({
        ...it,
        orderId: createdOrder.id,
      });

      const p = prodMap.get(it.productId)!;
      const prevStock = p.stock;
      const nextStock = prevStock - it.quantity;

      await db.update(products).set({ stock: nextStock, updatedAt: new Date() }).where(eq(products.id, p.id));

      await db.insert(inventoryMovements).values({
        productId: p.id,
        type: 'exit',
        quantity: it.quantity,
        reason: `Venta - Pedido #${orderNumber}`,
        previousStock: prevStock,
        newStock: nextStock,
        performedBy: 'Sistema Tienda Fénix',
      });
    }

    res.status(201).json({
      message: 'Pedido realizado con éxito',
      order: createdOrder,
    });
  } catch (error: any) {
    console.error('Error in POST /api/orders:', error);
    res.status(500).json({ error: error.message || 'Error al procesar el pedido' });
  }
});

app.put('/api/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, notes, paymentStatus } = req.body;
    const validStatuses = ['received', 'preparing', 'shipped', 'delivered', 'cancelled'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado de pedido no válido' });
    }

    const currentOrder = await db.select().from(orders).where(eq(orders.id, id));
    if (currentOrder.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const oldStatus = currentOrder[0].status;

    // Si se cancela un pedido que no estaba cancelado, reingresar stock
    if (status === 'cancelled' && oldStatus !== 'cancelled') {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
      for (const item of items) {
        if (item.productId) {
          const prodList = await db.select().from(products).where(eq(products.id, item.productId));
          if (prodList.length > 0) {
            const p = prodList[0];
            const nextStock = p.stock + item.quantity;
            await db.update(products).set({ stock: nextStock }).where(eq(products.id, p.id));

            await db.insert(inventoryMovements).values({
              productId: p.id,
              type: 'entry',
              quantity: item.quantity,
              reason: `Reintegro por cancelación de Pedido #${currentOrder[0].orderNumber}`,
              previousStock: p.stock,
              newStock: nextStock,
              performedBy: 'Administrador',
            });
          }
        }
      }
    }

    const updated = await db
      .update(orders)
      .set({
        status: status || currentOrder[0].status,
        notes: notes !== undefined ? notes : currentOrder[0].notes,
        paymentStatus: paymentStatus || currentOrder[0].paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Error in PUT /api/orders/:id/status:', error);
    res.status(500).json({ error: 'Error al actualizar estado del pedido' });
  }
});

// ==========================================
// 8. REPORTES & DASHBOARD
// ==========================================
app.get('/api/reports/dashboard', async (_req: Request, res: Response) => {
  try {
    const settings = await getOrInitSettings();
    const lowStockThreshold = settings.lowStockThreshold || 5;

    const allProducts = await db.select().from(products);
    const allOrders = await db.select().from(orders);
    const allCustomers = await db.select().from(customers);

    // Ventas de hoy
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayOrders = allOrders.filter(o => {
      const d = o.createdAt ? new Date(o.createdAt) : null;
      return d && d >= todayStart && o.status !== 'cancelled';
    });

    const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);

    // Pedidos pendientes (recibido o en preparación)
    const pendingOrders = allOrders.filter(
      o => o.status === 'received' || o.status === 'preparing'
    );

    // Productos agotados o con bajo stock
    const outOfStockProducts = allProducts.filter(p => p.stock <= 0);
    const lowStockProducts = allProducts.filter(
      p => p.stock > 0 && p.stock <= lowStockThreshold
    );

    // Valor total del inventario disponible
    const totalInventoryValue = allProducts.reduce((sum, p) => sum + p.stock * p.price, 0);
    const totalStockUnits = allProducts.reduce((sum, p) => sum + p.stock, 0);

    // Ventas totales históricas
    const totalRevenue = allOrders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    res.json({
      todaySales,
      todayOrdersCount: todayOrders.length,
      totalRevenue,
      pendingOrdersCount: pendingOrders.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockCount: lowStockProducts.length,
      totalCustomers: allCustomers.length,
      totalProducts: allProducts.length,
      totalInventoryValue,
      totalStockUnits,
      recentOrders: allOrders.slice(0, 6),
      alertProducts: [...outOfStockProducts, ...lowStockProducts].slice(0, 8),
    });
  } catch (error: any) {
    console.error('Error in GET /api/reports/dashboard:', error);
    res.status(500).json({ error: 'Error al generar indicadores del dashboard' });
  }
});

app.get('/api/reports/analytics', async (_req: Request, res: Response) => {
  try {
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const allItems = await db.select().from(orderItems);
    const allProducts = await db.select().from(products);
    const allCategories = await db.select().from(categories);

    // Agrupar ventas diarias (últimos 14 días)
    const dailySalesMap: { [dateStr: string]: { date: string; total: number; count: number } } = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailySalesMap[key] = { date: key, total: 0, count: 0 };
    }

    allOrders
      .filter(o => o.status !== 'cancelled' && o.createdAt)
      .forEach(o => {
        const key = new Date(o.createdAt!).toISOString().split('T')[0];
        if (dailySalesMap[key]) {
          dailySalesMap[key].total += o.total;
          dailySalesMap[key].count += 1;
        }
      });

    // Productos más vendidos
    const productSalesMap: {
      [id: number]: {
        name: string;
        code: string;
        units: number;
        revenue: number;
        image: string;
      };
    } = {};

    allItems.forEach(item => {
      const pid = item.productId || 0;
      if (!productSalesMap[pid]) {
        productSalesMap[pid] = {
          name: item.productName,
          code: item.productCode,
          units: 0,
          revenue: 0,
          image: item.productImage || '',
        };
      }
      productSalesMap[pid].units += item.quantity;
      productSalesMap[pid].revenue += item.subtotal;
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.units - a.units)
      .slice(0, 10);

    // Ventas por método de pago
    const paymentMethodsMap: { [method: string]: { method: string; total: number; count: number } } = {};
    allOrders
      .filter(o => o.status !== 'cancelled')
      .forEach(o => {
        const m = o.paymentMethod;
        if (!paymentMethodsMap[m]) {
          paymentMethodsMap[m] = { method: m, total: 0, count: 0 };
        }
        paymentMethodsMap[m].total += o.total;
        paymentMethodsMap[m].count += 1;
      });

    res.json({
      dailySales: Object.values(dailySalesMap),
      topProducts,
      paymentStats: Object.values(paymentMethodsMap),
      categoryCount: allCategories.length,
      productCount: allProducts.length,
    });
  } catch (error: any) {
    console.error('Error in GET /api/reports/analytics:', error);
    res.status(500).json({ error: 'Error al generar analíticas' });
  }
});

// ==========================================
// 9. INTELIGENCIA ARTIFICIAL (GEMINI 3.8 FLASH)
// ==========================================
app.post('/api/ai/description', async (req: Request, res: Response) => {
  try {
    const { name, category, highlights } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre del producto es requerido' });
    }
    const result = await generateProductDescription(name, category || 'General', highlights || '');
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/description:', error);
    res.status(500).json({ error: 'Error al generar descripción con IA' });
  }
});

app.post('/api/ai/recommend-price', async (req: Request, res: Response) => {
  try {
    const { name, category, costOrBasePrice } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'El nombre del producto es requerido' });
    }
    const result = await recommendProductPrice(name, category || 'General', Number(costOrBasePrice) || 0);
    res.json(result);
  } catch (error: any) {
    console.error('Error in /api/ai/recommend-price:', error);
    res.status(500).json({ error: 'Error al recomendar precio con IA' });
  }
});

app.post('/api/ai/trends', async (_req: Request, res: Response) => {
  try {
    const allOrders = await db.select().from(orders).limit(50);
    const allProds = await db.select().from(products).limit(50);
    const analysis = await analyzeShoppingTrends(allOrders, allProds);
    res.json(analysis);
  } catch (error: any) {
    console.error('Error in /api/ai/trends:', error);
    res.status(500).json({ error: 'Error al analizar tendencias con IA' });
  }
});

app.post('/api/ai/suggest-related', async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    const allProds = await db.select().from(products);
    const target = allProds.find(p => p.id === Number(productId));
    if (!target) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const suggestions = await suggestRelatedProducts(target, allProds);
    // Filtrar los objetos de productos sugeridos
    const matched = allProds.filter(p => suggestions.relatedProductCodes.includes(p.code));
    res.json({
      relatedProducts: matched,
      tip: suggestions.crossSellTip,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/suggest-related:', error);
    res.status(500).json({ error: 'Error al sugerir productos relacionados' });
  }
});

// ==========================================
// 10. SINCRONIZACIÓN DE USUARIOS & ROLES
// ==========================================
app.post('/api/auth/sync-user', async (req: Request, res: Response) => {
  try {
    const { uid, email, displayName } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID y correo son requeridos' });
    }

    // Revisar si ya existen usuarios. Si es el primer usuario, darle rol de admin
    const existingUsers = await db.select().from(users);
    const isFirstUser = existingUsers.length === 0;

    const userInDb = await db
      .insert(users)
      .values({
        uid,
        email: email.toLowerCase(),
        displayName: displayName || '',
        role: isFirstUser ? 'admin' : 'client',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: email.toLowerCase(),
          displayName: displayName || undefined,
        },
      })
      .returning();

    res.json(userInDb[0]);
  } catch (error: any) {
    console.error('Error in /api/auth/sync-user:', error);
    res.status(500).json({ error: 'Error al sincronizar usuario' });
  }
});

// ==========================================
// INTEGRACIÓN VITE DEV / PRODUCCIÓN
// ==========================================
async function startServer() {
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Tienda en Línea Fénix servidor listo en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
