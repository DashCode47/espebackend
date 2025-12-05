# Ejemplos de Uso - Establecimientos y Promociones

## 1. Crear un Establecimiento

**Endpoint:** `POST /api/establishments`  
**Autenticación:** Requerida (Bearer Token)

### Payload Mínimo

```json
{
  "name": "Switch Bar",
  "address": "Av. Principal 123, Frente a la ESPE"
}
```

### Payload Completo

```json
{
  "name": "Switch Bar",
  "description": "Bar y restaurante cerca de la ESPE con ambiente universitario",
  "address": "Av. Principal 123, Frente a la ESPE",
  "phone": "+593 99 999 9999",
  "email": "contacto@switchbar.com",
  "imageUrl": "https://example.com/images/switch-bar.jpg",
  "website": "https://switchbar.com",
  "isActive": true
}
```

### Ejemplo con cURL

```bash
curl -X POST http://localhost:3000/api/establishments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Switch Bar",
    "description": "Bar y restaurante cerca de la ESPE",
    "address": "Av. Principal 123, Frente a la ESPE",
    "phone": "+593 99 999 9999",
    "email": "contacto@switchbar.com",
    "imageUrl": "https://example.com/images/switch-bar.jpg",
    "website": "https://switchbar.com",
    "isActive": true
  }'
```

### Respuesta Exitosa (201 Created)

```json
{
  "status": "success",
  "data": {
    "establishment": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Switch Bar",
      "description": "Bar y restaurante cerca de la ESPE con ambiente universitario",
      "address": "Av. Principal 123, Frente a la ESPE",
      "phone": "+593 99 999 9999",
      "email": "contacto@switchbar.com",
      "imageUrl": "https://example.com/images/switch-bar.jpg",
      "website": "https://switchbar.com",
      "isActive": true,
      "createdAt": "2025-12-05T00:00:00.000Z",
      "updatedAt": "2025-12-05T00:00:00.000Z",
      "promotions": []
    }
  }
}
```

---

## 2. Crear un Establecimiento y Añadir una Promoción

Este proceso requiere dos pasos:

### Paso 1: Crear el Establecimiento

```json
POST /api/establishments
{
  "name": "Pizza Express",
  "description": "Pizzería con delivery rápido",
  "address": "Av. Universitaria 456",
  "phone": "+593 98 888 8888",
  "email": "pedidos@pizzaexpress.com",
  "isActive": true
}
```

**Respuesta:** Guarda el `id` del establecimiento creado (ej: `"id": "abc123-def456-..."`)

### Paso 2: Crear la Promoción para ese Establecimiento

```json
POST /api/promotions
{
  "title": "2x1 en Pizzas Medianas",
  "description": "Lleva 2 pizzas medianas al precio de 1. Válido todos los martes",
  "category": "FOOD",
  "discount": 50,
  "validUntil": "2025-12-31T23:59:59.000Z",
  "establishmentId": "abc123-def456-...",
  "imageUrl": "https://example.com/images/promo-2x1.jpg",
  "isActive": true
}
```

---

## 3. Añadir una Promoción a un Establecimiento Existente

**Endpoint:** `POST /api/promotions`  
**Autenticación:** Requerida (Bearer Token)

### Payload Mínimo

```json
{
  "title": "Happy Hour",
  "description": "Descuento del 20% en todas las bebidas de 5pm a 7pm",
  "category": "DRINKS",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "establishmentId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Payload Completo

```json
{
  "title": "Happy Hour",
  "description": "Descuento del 20% en todas las bebidas de 5pm a 7pm. Válido de lunes a viernes",
  "category": "DRINKS",
  "discount": 20,
  "validUntil": "2025-12-31T23:59:59.000Z",
  "establishmentId": "550e8400-e29b-41d4-a716-446655440000",
  "imageUrl": "https://example.com/images/happy-hour.jpg",
  "isActive": true
}
```

### Ejemplo con cURL

```bash
curl -X POST http://localhost:3000/api/promotions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Happy Hour",
    "description": "Descuento del 20% en todas las bebidas de 5pm a 7pm",
    "category": "DRINKS",
    "discount": 20,
    "validUntil": "2025-12-31T23:59:59.000Z",
    "establishmentId": "550e8400-e29b-41d4-a716-446655440000",
    "imageUrl": "https://example.com/images/happy-hour.jpg",
    "isActive": true
  }'
```

### Respuesta Exitosa (201 Created)

```json
{
  "status": "success",
  "data": {
    "promotion": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "Happy Hour",
      "description": "Descuento del 20% en todas las bebidas de 5pm a 7pm",
      "category": "DRINKS",
      "discount": 20,
      "startDate": "2025-12-05T00:00:00.000Z",
      "endDate": "2025-12-31T23:59:59.000Z",
      "isActive": true,
      "createdAt": "2025-12-05T00:00:00.000Z",
      "updatedAt": "2025-12-05T00:00:00.000Z",
      "establishmentId": "550e8400-e29b-41d4-a716-446655440000",
      "establishment": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Switch Bar",
        "address": "Av. Principal 123, Frente a la ESPE",
        "isActive": true
      }
    }
  }
}
```

---

## Categorías de Promociones Disponibles

Las categorías válidas son:
- `FOOD` - Comida
- `DRINKS` - Bebidas
- `EVENTS` - Eventos
- `PARTIES` - Fiestas
- `OTHER` - Otros

---

## Ejemplo Completo: Flujo de Trabajo

### 1. Crear Establecimiento

```bash
POST /api/establishments
{
  "name": "Café Universitario",
  "description": "Cafetería con WiFi gratuito para estudiantes",
  "address": "Calle Estudiantes 789",
  "phone": "+593 97 777 7777",
  "email": "info@cafeuniversitario.com",
  "isActive": true
}
```

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "establishment": {
      "id": "est-123-456"
    }
  }
}
```

### 2. Añadir Promoción de Comida

```bash
POST /api/promotions
{
  "title": "Desayuno Estudiantil",
  "description": "Desayuno completo + café por solo $5. Válido de lunes a viernes hasta las 10am",
  "category": "FOOD",
  "discount": 25,
  "validUntil": "2025-12-31T23:59:59.000Z",
  "establishmentId": "est-123-456",
  "isActive": true
}
```

### 3. Añadir Promoción de Bebidas

```bash
POST /api/promotions
{
  "title": "Refill Gratis",
  "description": "Segunda taza de café gratis con la compra de cualquier bebida",
  "category": "DRINKS",
  "validUntil": "2025-12-31T23:59:59.000Z",
  "establishmentId": "est-123-456",
  "isActive": true
}
```

---

## Notas Importantes

1. **Campo `validUntil`**: Debe ser una fecha en formato ISO 8601 (string). La promoción comenzará automáticamente desde el momento de creación hasta la fecha especificada.

2. **Campo `discount`**: Es opcional y representa el porcentaje de descuento (0-100). Si no se especifica, será 0.

3. **Campo `establishmentId`**: Es obligatorio y debe ser un ID válido de un establecimiento existente.

4. **Campo `isActive`**: Por defecto es `true`. Si se establece en `false`, la promoción no aparecerá en las búsquedas públicas.

5. **Filtrado automático**: Las promociones solo se muestran si:
   - `isActive` es `true`
   - La fecha actual está entre `startDate` y `endDate`

---

## Obtener Establecimientos con Promociones Activas

**Endpoint:** `GET /api/establishments?hasActivePromotions=true`

Esto retornará solo los establecimientos que tienen al menos una promoción activa y vigente.

```bash
GET /api/establishments?hasActivePromotions=true&page=1&limit=10
```

**Respuesta:**
```json
{
  "status": "success",
  "data": {
    "establishments": [
      {
        "id": "est-123-456",
        "name": "Café Universitario",
        "address": "Calle Estudiantes 789",
        "promotions": [
          {
            "id": "promo-789",
            "title": "Desayuno Estudiantil",
            "description": "...",
            "category": "FOOD",
            "discount": 25
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

