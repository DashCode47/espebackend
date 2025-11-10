# Documentación API - Módulo de Carpooling (Viajes Compartidos)

Esta documentación describe todos los endpoints disponibles para el módulo de carpooling, diseñada para facilitar la implementación del frontend.

## Autenticación

Todos los endpoints protegidos requieren autenticación mediante JWT. El token debe enviarse en el header `Authorization` con el formato:
```
Authorization: Bearer <token>
```

## Roles de Usuario

- **STUDENT**: Usuario estándar que puede unirse a viajes como pasajero
- **DRIVER**: Usuario con rol de conductor que puede crear y gestionar viajes

---

## Endpoints Públicos

### 1. Listar Viajes Activos

**GET** `/api/trips`

Obtiene una lista paginada de todos los viajes activos disponibles. Incluye información del conductor y filtros opcionales.

**Parámetros de consulta (query params):**
- `origin` (opcional): Filtrar por origen (búsqueda parcial, case-insensitive)
- `destination` (opcional): Filtrar por destino (búsqueda parcial, case-insensitive)
- `date` (opcional): Filtrar por fecha específica (formato: YYYY-MM-DD)
- `page` (opcional, default: 1): Número de página para paginación
- `limit` (opcional, default: 20): Cantidad de resultados por página

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": {
    "trips": [
      {
        "id": "uuid",
        "driverId": "uuid",
        "origin": "string",
        "destination": "string",
        "departureTime": "ISO 8601 datetime",
        "availableSeats": "number",
        "price": "number | null",
        "notes": "string | null",
        "status": "ACTIVE",
        "createdAt": "ISO 8601 datetime",
        "updatedAt": "ISO 8601 datetime",
        "driver": {
          "id": "uuid",
          "name": "string",
          "email": "string",
          "avatarUrl": "string | null",
          "career": "string",
          "averageRating": "number | null",
          "totalRatings": "number"
        },
        "requests": [
          {
            "id": "uuid",
            "passenger": {
              "id": "uuid",
              "name": "string",
              "avatarUrl": "string | null"
            }
          }
        ]
      }
    ],
    "pagination": {
      "page": "number",
      "limit": "number",
      "total": "number",
      "pages": "number"
    }
  }
}
```

**Notas:**
- Solo muestra viajes con status `ACTIVE`
- No muestra viajes con fecha de salida en el pasado
- Incluye el rating promedio del conductor calculado automáticamente
- Muestra los pasajeros aceptados en cada viaje

---

### 2. Obtener Detalle de un Viaje

**GET** `/api/trips/:id`

Obtiene la información completa de un viaje específico, incluyendo todas las solicitudes, calificaciones y detalles del conductor.

**Parámetros de ruta:**
- `id` (requerido): ID del viaje (UUID)

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": {
    "trip": {
      "id": "uuid",
      "driverId": "uuid",
      "origin": "string",
      "destination": "string",
      "departureTime": "ISO 8601 datetime",
      "availableSeats": "number",
      "price": "number | null",
      "notes": "string | null",
      "status": "ACTIVE | FULL | CANCELLED",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime",
      "driver": {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "avatarUrl": "string | null",
        "career": "string",
        "bio": "string | null",
        "averageRating": "number | null",
        "totalRatings": "number"
      },
      "requests": [
        {
          "id": "uuid",
          "passengerId": "uuid",
          "status": "PENDING | ACCEPTED | REJECTED",
          "createdAt": "ISO 8601 datetime",
          "passenger": {
            "id": "uuid",
            "name": "string",
            "avatarUrl": "string | null",
            "career": "string"
          }
        }
      ],
      "ratings": [
        {
          "id": "uuid",
          "rating": "number (1-5)",
          "comment": "string | null",
          "createdAt": "ISO 8601 datetime",
          "rater": {
            "id": "uuid",
            "name": "string",
            "avatarUrl": "string | null"
          }
        }
      ]
    }
  }
}
```

**Errores posibles:**
- `404`: Viaje no encontrado

---

## Endpoints Protegidos (Requieren Autenticación)

### 3. Crear un Viaje

**POST** `/api/trips`

Crea un nuevo viaje. Solo usuarios con rol `DRIVER` pueden crear viajes.

**Autenticación:** Requerida  
**Rol requerido:** DRIVER

**Body (JSON):**
```json
{
  "origin": "string (requerido)",
  "destination": "string (requerido)",
  "departureTime": "ISO 8601 datetime string (requerido)",
  "availableSeats": "number (requerido, mínimo: 1)",
  "price": "number (opcional)",
  "notes": "string (opcional)"
}
```

**Validaciones:**
- `origin`, `destination`, `departureTime` y `availableSeats` son obligatorios
- `departureTime` no puede ser una fecha en el pasado
- `availableSeats` debe ser al menos 1
- No puede haber otro viaje activo del mismo conductor en un rango de ±2 horas

**Respuesta exitosa (201):**
```json
{
  "status": "success",
  "data": {
    "trip": {
      "id": "uuid",
      "driverId": "uuid",
      "origin": "string",
      "destination": "string",
      "departureTime": "ISO 8601 datetime",
      "availableSeats": "number",
      "price": "number | null",
      "notes": "string | null",
      "status": "ACTIVE",
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime",
      "driver": {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "avatarUrl": "string | null",
        "career": "string"
      }
    }
  }
}
```

**Errores posibles:**
- `400`: Datos inválidos (fecha pasada, asientos inválidos, etc.)
- `401`: No autenticado
- `403`: Solo conductores pueden crear viajes
- `409`: Ya existe un viaje activo en ese horario

---

### 4. Actualizar un Viaje

**PUT** `/api/trips/:id`

Actualiza la información de un viaje existente. Solo el creador del viaje puede actualizarlo.

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id` (requerido): ID del viaje (UUID)

**Body (JSON) - Todos los campos son opcionales:**
```json
{
  "origin": "string (opcional)",
  "destination": "string (opcional)",
  "departureTime": "ISO 8601 datetime string (opcional)",
  "availableSeats": "number (opcional, mínimo: 1)",
  "price": "number (opcional)",
  "notes": "string (opcional)"
}
```

**Validaciones:**
- Solo el creador del viaje puede actualizarlo
- No se puede actualizar un viaje cancelado
- `departureTime` no puede ser una fecha en el pasado
- `availableSeats` no puede ser menor al número de pasajeros ya aceptados

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": {
    "trip": {
      // Mismo formato que la respuesta de crear viaje
    }
  }
}
```

**Errores posibles:**
- `400`: Datos inválidos o viaje cancelado
- `401`: No autenticado
- `403`: No eres el creador del viaje
- `404`: Viaje no encontrado

---

### 5. Cancelar un Viaje

**DELETE** `/api/trips/:id`

Cancela un viaje existente. Solo el creador puede cancelarlo. Automáticamente rechaza todas las solicitudes pendientes y notifica a los pasajeros aceptados.

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id` (requerido): ID del viaje (UUID)

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "message": "Trip cancelled successfully",
  "data": {
    "trip": {
      "id": "uuid",
      "status": "CANCELLED",
      // ... resto de campos del viaje
    }
  }
}
```

**Errores posibles:**
- `400`: El viaje ya está cancelado
- `401`: No autenticado
- `403`: No eres el creador del viaje
- `404`: Viaje no encontrado

---

### 6. Unirse a un Viaje

**POST** `/api/trips/:id/join`

Crea una solicitud para unirse a un viaje como pasajero. Cualquier usuario autenticado puede unirse a viajes activos.

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id` (requerido): ID del viaje (UUID)

**Body:** No requiere body

**Validaciones:**
- El viaje debe estar activo (status: ACTIVE)
- El conductor no puede unirse a su propio viaje
- No puede haber una solicitud pendiente o aceptada previa del mismo usuario

**Respuesta exitosa (201):**
```json
{
  "status": "success",
  "message": "Trip request created successfully",
  "data": {
    "request": {
      "id": "uuid",
      "tripId": "uuid",
      "passengerId": "uuid",
      "status": "PENDING",
      "createdAt": "ISO 8601 datetime",
      "passenger": {
        "id": "uuid",
        "name": "string",
        "avatarUrl": "string | null",
        "career": "string"
      }
    }
  }
}
```

**Errores posibles:**
- `400`: Viaje no activo o intento de unirse a propio viaje
- `401`: No autenticado
- `404`: Viaje no encontrado
- `409`: Ya existe una solicitud para este viaje

**Nota:** El conductor recibirá una notificación cuando se cree la solicitud.

---

### 7. Confirmar Pasajero (Aceptar Solicitud)

**POST** `/api/trips/:id/confirm`

El conductor acepta una solicitud de un pasajero para unirse al viaje. Solo conductores pueden usar este endpoint.

**Autenticación:** Requerida  
**Rol requerido:** DRIVER

**Parámetros de ruta:**
- `id` (requerido): ID del viaje (UUID)

**Body (JSON):**
```json
{
  "requestId": "uuid (requerido)"
}
```

**Validaciones:**
- Solo el conductor del viaje puede confirmar pasajeros
- El viaje debe estar activo
- La solicitud debe estar en estado PENDING
- Debe haber asientos disponibles

**Comportamiento especial:**
- Si después de aceptar el pasajero, el viaje se llena (availableSeats = pasajeros aceptados), el status cambia automáticamente a `FULL`
- El pasajero aceptado recibe una notificación

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "message": "Passenger confirmed successfully",
  "data": {
    "request": {
      "id": "uuid",
      "tripId": "uuid",
      "passengerId": "uuid",
      "status": "ACCEPTED",
      "createdAt": "ISO 8601 datetime",
      "passenger": {
        "id": "uuid",
        "name": "string",
        "avatarUrl": "string | null",
        "career": "string"
      }
    },
    "trip": {
      "id": "uuid",
      "status": "ACTIVE | FULL",
      "availableSeats": "number",
      // ... resto de campos
    }
  }
}
```

**Errores posibles:**
- `400`: Viaje lleno, solicitud inválida o viaje no activo
- `401`: No autenticado
- `403`: Solo el conductor puede confirmar pasajeros
- `404`: Viaje o solicitud no encontrados

---

### 8. Calificar Conductor

**POST** `/api/trips/:id/rating`

Permite a un pasajero que participó en un viaje calificar al conductor. Solo se puede calificar una vez por viaje.

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id` (requerido): ID del viaje (UUID)

**Body (JSON):**
```json
{
  "rating": "number (requerido, rango: 1-5)",
  "comment": "string (opcional)"
}
```

**Validaciones:**
- Solo usuarios que fueron pasajeros aceptados pueden calificar
- Solo se puede calificar una vez por viaje
- El rating debe estar entre 1 y 5

**Respuesta exitosa (201):**
```json
{
  "status": "success",
  "message": "Rating created successfully",
  "data": {
    "rating": {
      "id": "uuid",
      "tripId": "uuid",
      "raterId": "uuid",
      "driverId": "uuid",
      "rating": "number (1-5)",
      "comment": "string | null",
      "createdAt": "ISO 8601 datetime",
      "rater": {
        "id": "uuid",
        "name": "string",
        "avatarUrl": "string | null"
      }
    }
  }
}
```

**Errores posibles:**
- `400`: Rating inválido (fuera del rango 1-5)
- `401`: No autenticado
- `403`: Solo puedes calificar viajes en los que participaste
- `404`: Viaje no encontrado
- `409`: Ya calificaste este viaje

---

### 9. Obtener Viajes de un Usuario

**GET** `/api/users/:id/trips`

Obtiene todos los viajes creados o en los que participó un usuario específico.

**Autenticación:** Requerida

**Parámetros de ruta:**
- `id` (requerido): ID del usuario (UUID)

**Parámetros de consulta (query params):**
- `type` (opcional, default: "all"): Tipo de viajes a listar
  - `"created"`: Solo viajes creados por el usuario
  - `"joined"`: Solo viajes en los que el usuario participó como pasajero
  - `"all"`: Todos los viajes (creados y unidos)

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": {
    "trips": [
      {
        "id": "uuid",
        "driverId": "uuid",
        "origin": "string",
        "destination": "string",
        "departureTime": "ISO 8601 datetime",
        "availableSeats": "number",
        "price": "number | null",
        "notes": "string | null",
        "status": "ACTIVE | FULL | CANCELLED",
        "createdAt": "ISO 8601 datetime",
        "updatedAt": "ISO 8601 datetime",
        "userRole": "driver | passenger",
        "driver": {
          "id": "uuid",
          "name": "string",
          "email": "string",
          "avatarUrl": "string | null",
          "career": "string"
        },
        "requests": [
          // Array de solicitudes con información de pasajeros
        ]
      }
    ]
  }
}
```

**Nota:** El campo `userRole` indica si el usuario es "driver" (creó el viaje) o "passenger" (se unió al viaje).

**Errores posibles:**
- `401`: No autenticado
- `404`: Usuario no encontrado

---

## Estados y Enums

### TripStatus
- `ACTIVE`: Viaje activo y disponible
- `FULL`: Viaje completo (sin asientos disponibles)
- `CANCELLED`: Viaje cancelado

### TripRequestStatus
- `PENDING`: Solicitud pendiente de aprobación
- `ACCEPTED`: Solicitud aceptada por el conductor
- `REJECTED`: Solicitud rechazada

### UserRole
- `STUDENT`: Usuario estándar
- `DRIVER`: Usuario con permisos de conductor

---

## Notificaciones

El sistema genera automáticamente notificaciones en los siguientes casos:

1. **Nueva solicitud de viaje**: Cuando un pasajero solicita unirse a un viaje, el conductor recibe una notificación.
2. **Solicitud aceptada**: Cuando el conductor acepta una solicitud, el pasajero recibe una notificación.
3. **Viaje cancelado**: Cuando un viaje se cancela, todos los pasajeros aceptados reciben una notificación.

Las notificaciones se pueden obtener mediante el endpoint de notificaciones existente en `/api/notifications`.

---

## Ejemplos de Uso

### Flujo típico para un conductor:

1. **Crear viaje**: `POST /api/trips` con los datos del viaje
2. **Ver solicitudes**: `GET /api/trips/:id` para ver las solicitudes pendientes
3. **Aceptar pasajero**: `POST /api/trips/:id/confirm` con el `requestId`
4. **Actualizar viaje** (si es necesario): `PUT /api/trips/:id`
5. **Cancelar viaje** (si es necesario): `DELETE /api/trips/:id`

### Flujo típico para un pasajero:

1. **Buscar viajes**: `GET /api/trips` con filtros opcionales
2. **Ver detalles**: `GET /api/trips/:id` para ver información completa
3. **Unirse a viaje**: `POST /api/trips/:id/join`
4. **Esperar confirmación**: El conductor recibirá la solicitud y puede aceptarla
5. **Calificar conductor**: `POST /api/trips/:id/rating` después del viaje

---

## Consideraciones para el Frontend

1. **Manejo de estados**: Los viajes pueden cambiar de `ACTIVE` a `FULL` automáticamente cuando se acepta un pasajero y se llenan los asientos.

2. **Actualización en tiempo real**: Considera implementar polling o WebSockets para actualizar el estado de las solicitudes y viajes.

3. **Validación de fechas**: Asegúrate de validar en el frontend que las fechas no sean en el pasado antes de enviar la solicitud.

4. **Manejo de errores**: Todos los errores siguen el formato:
   ```json
   {
     "status": "error,
     "message": "Mensaje descriptivo del error"
   }
   ```

5. **Paginación**: Los endpoints que devuelven listas usan paginación. Implementa controles de paginación en el frontend.

6. **Rating promedio**: El rating promedio del conductor se calcula automáticamente y se incluye en las respuestas. No es necesario calcularlo en el frontend.

7. **Permisos**: Verifica el rol del usuario antes de mostrar opciones de crear viajes o confirmar pasajeros.

---

## Notas Adicionales

- Todos los timestamps están en formato ISO 8601
- Los IDs son UUIDs
- Los precios son números decimales (Float) y pueden ser null
- El campo `notes` es opcional y puede ser null
- Las imágenes (avatarUrl) son URLs y pueden ser null
- El sistema automáticamente filtra viajes pasados en la lista de viajes activos

