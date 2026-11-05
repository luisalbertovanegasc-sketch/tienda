import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

/**
 * Genera una descripción atractiva para producto con viñetas y tono persuasivo
 */
export async function generateProductDescription(name: string, category: string, highlights: string): Promise<{
  description: string;
  bulletPoints: string[];
  suggestedTags: string[];
}> {
  if (!ai) {
    return {
      description: `${name} es un producto de alta calidad en la categoría ${category}. Diseñado para brindar el mejor rendimiento, durabilidad y satisfacción garantizada.`,
      bulletPoints: ['Calidad prémium garantizada', 'Diseño moderno y funcional', 'Excelente relación costo-beneficio'],
      suggestedTags: [category, 'oferta', 'calidad'],
    };
  }

  const prompt = `Actúa como un redactor experto en comercio electrónico para la "Tienda en Línea Fénix".
Genera una descripción cautivadora, profesional y persuasiva en español para este producto:
- Nombre: ${name}
- Categoría: ${category}
- Características / Palabras clave: ${highlights || 'Producto de alta calidad'}

Devuelve un JSON con:
- description: texto persuasivo de 2 a 3 párrafos cortos destacando beneficios y propuesta de valor
- bulletPoints: lista de 3 a 5 beneficios clave
- suggestedTags: lista de 4 a 6 etiquetas recomendadas para búsqueda`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          bulletPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          suggestedTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['description', 'bulletPoints', 'suggestedTags'],
      },
    },
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text);
  } catch (err) {
    console.error('Error parsing Gemini description response:', err);
    return {
      description: `${name} es una excelente opción dentro de la categoría de ${category}. Brinda máxima durabilidad y estilo.`,
      bulletPoints: ['Garantía de satisfacción', 'Envío seguro a todo el país', 'Materiales de primera calidad'],
      suggestedTags: [category, 'fénix'],
    };
  }
}

/**
 * Recomienda precio de venta normal y de oferta
 */
export async function recommendProductPrice(productName: string, category: string, costOrBasePrice?: number): Promise<{
  suggestedRegularPrice: number;
  suggestedOfferPrice: number;
  strategyRationale: string;
  profitMarginPercent: number;
}> {
  if (!ai) {
    const base = costOrBasePrice && costOrBasePrice > 0 ? costOrBasePrice * 1.35 : 50000;
    return {
      suggestedRegularPrice: Math.round(base),
      suggestedOfferPrice: Math.round(base * 0.85),
      strategyRationale: 'Margen comercial sugerido estándar del 35% con descuento promocional del 15%.',
      profitMarginPercent: 35,
    };
  }

  const prompt = `Actúa como especialista en pricing para e-commerce.
Calcula y recomienda el precio de venta en moneda local para:
- Producto: ${productName}
- Categoría: ${category}
- Precio base/costo de referencia (si se indicó): ${costOrBasePrice || 'No especificado'}

Devuelve un JSON con:
- suggestedRegularPrice: número entero con el precio de lista regular
- suggestedOfferPrice: número entero con el precio de oferta atractivo (descuento del 10% al 20%)
- strategyRationale: explicación breve de la estrategia psicológica de precio
- profitMarginPercent: margen de ganancia estimado en porcentaje (ej: 35)`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestedRegularPrice: { type: Type.INTEGER },
          suggestedOfferPrice: { type: Type.INTEGER },
          strategyRationale: { type: Type.STRING },
          profitMarginPercent: { type: Type.INTEGER },
        },
        required: ['suggestedRegularPrice', 'suggestedOfferPrice', 'strategyRationale', 'profitMarginPercent'],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (err) {
    console.error('Error parsing price recommendation:', err);
    return {
      suggestedRegularPrice: costOrBasePrice ? costOrBasePrice * 1.3 : 45000,
      suggestedOfferPrice: costOrBasePrice ? costOrBasePrice * 1.15 : 39900,
      strategyRationale: 'Estrategia de precio competitivo para impulso de ventas inicial.',
      profitMarginPercent: 30,
    };
  }
}

/**
 * Analiza tendencias de compra y genera insights ejecutivos
 */
export async function analyzeShoppingTrends(orderData: any[], productCatalog: any[]): Promise<{
  executiveSummary: string;
  topTrends: string[];
  restockAlerts: string[];
  marketingRecommendations: string[];
}> {
  if (!ai) {
    return {
      executiveSummary: 'Tienda en fase inicial. Continúa ingresando productos y gestionando pedidos para obtener análisis predictivos detallados.',
      topTrends: ['Configuración inicial del catálogo en curso', 'Promociones de lanzamiento recomendadas'],
      restockAlerts: ['Mantener stock mínimo de seguridad en productos clave'],
      marketingRecommendations: ['Compartir catálogo por WhatsApp y redes sociales para atraer primeros compradores'],
    };
  }

  const summaryData = {
    totalOrders: orderData.length,
    recentOrders: orderData.slice(0, 15).map(o => ({
      num: o.orderNumber,
      total: o.total,
      payment: o.paymentMethod,
      status: o.status,
      date: o.createdAt,
    })),
    catalogCount: productCatalog.length,
    catalogSample: productCatalog.slice(0, 20).map(p => ({
      name: p.name,
      stock: p.stock,
      price: p.price,
      status: p.status,
    })),
  };

  const prompt = `Analiza las tendencias de ventas, inventario y comportamiento comercial para "Tienda en Línea Fénix".
Datos actuales del negocio:
${JSON.stringify(summaryData, null, 2)}

Genera un análisis en español con:
- executiveSummary: resumen ejecutivo de 1 a 2 párrafos sobre el estado comercial
- topTrends: lista de 3 a 4 tendencias detectadas
- restockAlerts: lista de 2 a 3 recomendaciones sobre stock e inventario
- marketingRecommendations: lista de 3 recomendaciones prácticas para aumentar ventas`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          topTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
          restockAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
          marketingRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['executiveSummary', 'topTrends', 'restockAlerts', 'marketingRecommendations'],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (err) {
    return {
      executiveSummary: 'El sistema está recopilando datos de pedidos para generar estadísticas detalladas.',
      topTrends: ['Diversificación de catálogo recomendada'],
      restockAlerts: ['Revisar productos con stock cercano a cero'],
      marketingRecommendations: ['Fomentar pedidos mediante WhatsApp y promociones'],
    };
  }
}

/**
 * Sugerir productos relacionados
 */
export async function suggestRelatedProducts(targetProduct: any, allProducts: any[]): Promise<{
  relatedProductCodes: string[];
  crossSellTip: string;
}> {
  if (!ai || allProducts.length <= 1) {
    const others = allProducts.filter(p => p.id !== targetProduct.id).slice(0, 3).map(p => p.code);
    return {
      relatedProductCodes: others,
      crossSellTip: 'Productos complementarios de la misma tienda recomendados.',
    };
  }

  const prompt = `Para la tienda online Fénix, sugiere qué productos de la lista son los mejores complementos para venta cruzada (cross-selling) con este producto:
Producto principal: ${targetProduct.name} (Categoría: ${targetProduct.categoryId}, Precio: ${targetProduct.price})

Catálogo disponible:
${JSON.stringify(allProducts.map(p => ({ code: p.code, name: p.name, categoryId: p.categoryId, price: p.price })), null, 2)}

Devuelve JSON con:
- relatedProductCodes: array con hasta 4 códigos (SKU) de productos más afines
- crossSellTip: consejo breve de venta cruzada (ej: "Ofrecer combo con 10% de descuento")`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          relatedProductCodes: { type: Type.ARRAY, items: { type: Type.STRING } },
          crossSellTip: { type: Type.STRING },
        },
        required: ['relatedProductCodes', 'crossSellTip'],
      },
    },
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (err) {
    return {
      relatedProductCodes: allProducts.filter(p => p.id !== targetProduct.id).slice(0, 3).map(p => p.code),
      crossSellTip: 'Sugerencia de productos afines para incrementar el ticket promedio.',
    };
  }
}
