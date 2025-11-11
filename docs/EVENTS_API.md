# API de Eventos - ESPEConnect

## Descripción General

Este documento describe la API REST completa para el módulo de Eventos de ESPEConnect. Los eventos permiten a los usuarios crear, gestionar y asistir a eventos sociales, académicos, privados, deportivos u otros dentro de la plataforma.

## Base URL

```
https://camplus.vercel.app/api/events
```

Para desarrollo local:
```
http://localhost:3000/api/events
```

## Autenticación

Todas las rutas requieren autenticación mediante JWT. Incluye el token en el header:

```
Authorization: Bearer <tu_token_jwt>
```

O simplemente:

```
Authorization: <tu_token_jwt>
```

## Modelo de Datos

### Event

```typescript
{
  id: string (UUID)
  nombre: string
  descripcion: string
  categoria: "SOCIAL" | "ACADEMIC" | "PRIVATE" | "SPORTS" | "OTHER"
  fechaInicio: string (ISO 8601 date-time)
  fechaFin: string | null (ISO 8601 date-time, opcional)
  ubicacion: string
  precio: number (default: 0)
  creadoPor: string (UUID del usuario creador)
  imagen: string | null (URL pública de la imagen)
  createdAt: string (ISO 8601 date-time)
  updatedAt: string (ISO 8601 date-time)
  asistentesCount: number (número de asistentes)
  isAttending: boolean (si el usuario actual está asistiendo)
  creador: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
}
```

### EventCategory

```typescript
enum EventCategory {
  SOCIAL = "SOCIAL"
  ACADEMIC = "ACADEMIC"
  PRIVATE = "PRIVATE"
  SPORTS = "SPORTS"
  OTHER = "OTHER"
}
```

## Endpoints

### 1. Listar Todos los Eventos

Obtiene una lista paginada de eventos con filtros opcionales.

**Endpoint:** `GET /api/events`

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| categoria | string | No | Filtrar por categoría (SOCIAL, ACADEMIC, PRIVATE, SPORTS, OTHER) |
| fechaInicio | string (ISO 8601) | No | Filtrar eventos desde esta fecha |
| fechaFin | string (ISO 8601) | No | Filtrar eventos hasta esta fecha |
| ubicacion | string | No | Búsqueda parcial por ubicación (case-insensitive) |
| page | number | No | Número de página (default: 1) |
| limit | number | No | Eventos por página (default: 10) |

**Ejemplo de Request:**

```http
GET /api/events?categoria=SOCIAL&page=1&limit=10
Authorization: Bearer <token>
```

**Ejemplo de Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "events": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "nombre": "Fiesta de Graduación",
        "descripcion": "Celebración de fin de carrera",
        "categoria": "SOCIAL",
        "fechaInicio": "2024-12-15T18:00:00.000Z",
        "fechaFin": "2024-12-15T23:00:00.000Z",
        "ubicacion": "Auditorio Principal ESPE",
        "precio": 25.50,
        "creadoPor": "123e4567-e89b-12d3-a456-426614174000",
        "imagen": "https://storage.googleapis.com/espe-connect/events/...",
        "createdAt": "2024-11-10T10:00:00.000Z",
        "updatedAt": "2024-11-10T10:00:00.000Z",
        "asistentesCount": 45,
        "isAttending": true,
        "creador": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Juan Pérez",
          "email": "juan@espe.edu.ec",
          "avatarUrl": "https://storage.googleapis.com/..."
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

**Errores Posibles:**

- `400 Bad Request`: Parámetros de filtro inválidos (categoría no válida)
- `401 Unauthorized`: Token no proporcionado o inválido

---

### 2. Obtener Detalles de un Evento

Obtiene la información completa de un evento específico.

**Endpoint:** `GET /api/events/:id`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string (UUID) | ID del evento |

**Ejemplo de Request:**

```http
GET /api/events/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Ejemplo de Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Fiesta de Graduación",
      "descripcion": "Celebración de fin de carrera",
      "categoria": "SOCIAL",
      "fechaInicio": "2024-12-15T18:00:00.000Z",
      "fechaFin": "2024-12-15T23:00:00.000Z",
      "ubicacion": "Auditorio Principal ESPE",
      "precio": 25.50,
      "creadoPor": "123e4567-e89b-12d3-a456-426614174000",
      "imagen": "https://storage.googleapis.com/espe-connect/events/...",
      "createdAt": "2024-11-10T10:00:00.000Z",
      "updatedAt": "2024-11-10T10:00:00.000Z",
      "asistentesCount": 45,
      "isAttending": true,
      "creador": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Juan Pérez",
        "email": "juan@espe.edu.ec",
        "avatarUrl": "https://storage.googleapis.com/...",
        "career": "Ingeniería en Sistemas"
      }
    }
  }
}
```

**Errores Posibles:**

- `401 Unauthorized`: Token no proporcionado o inválido
- `404 Not Found`: Evento no encontrado

---

### 3. Crear un Evento

Crea un nuevo evento. El usuario autenticado será el creador del evento.

**Endpoint:** `POST /api/events`

**Content-Type:** `multipart/form-data`

**Body Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| nombre | string | Sí | Nombre del evento |
| descripcion | string | Sí | Descripción del evento |
| categoria | string | Sí | Categoría (SOCIAL, ACADEMIC, PRIVATE, SPORTS, OTHER) |
| fechaInicio | string (ISO 8601) | Sí | Fecha y hora de inicio |
| fechaFin | string (ISO 8601) | No | Fecha y hora de fin (opcional) |
| ubicacion | string | Sí | Ubicación del evento |
| precio | number | No | Precio del evento (default: 0) |
| image | File | No | Imagen del evento (JPEG, PNG, etc.) |

**Ejemplo de Request (JavaScript/React Native):**

```javascript
const formData = new FormData();
formData.append('nombre', 'Fiesta de Graduación');
formData.append('descripcion', 'Celebración de fin de carrera');
formData.append('categoria', 'SOCIAL');
formData.append('fechaInicio', '2024-12-15T18:00:00.000Z');
formData.append('fechaFin', '2024-12-15T23:00:00.000Z');
formData.append('ubicacion', 'Auditorio Principal ESPE');
formData.append('precio', '25.50');

// Si hay imagen
if (imageUri) {
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'event.jpg'
  });
}

const response = await fetch('https://camplus.vercel.app/api/events', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});
```

**Ejemplo de Request (cURL):**

```bash
curl -X POST https://camplus.vercel.app/api/events \
  -H "Authorization: Bearer <token>" \
  -F "nombre=Fiesta de Graduación" \
  -F "descripcion=Celebración de fin de carrera" \
  -F "categoria=SOCIAL" \
  -F "fechaInicio=2024-12-15T18:00:00.000Z" \
  -F "fechaFin=2024-12-15T23:00:00.000Z" \
  -F "ubicacion=Auditorio Principal ESPE" \
  -F "precio=25.50" \
  -F "image=@/path/to/image.jpg"
```

**Ejemplo de Response (201 Created):**

```json
{
  "status": "success",
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Fiesta de Graduación",
      "descripcion": "Celebración de fin de carrera",
      "categoria": "SOCIAL",
      "fechaInicio": "2024-12-15T18:00:00.000Z",
      "fechaFin": "2024-12-15T23:00:00.000Z",
      "ubicacion": "Auditorio Principal ESPE",
      "precio": 25.50,
      "creadoPor": "123e4567-e89b-12d3-a456-426614174000",
      "imagen": "https://storage.googleapis.com/espe-connect/events/...",
      "createdAt": "2024-11-10T10:00:00.000Z",
      "updatedAt": "2024-11-10T10:00:00.000Z",
      "asistentesCount": 0,
      "isAttending": false,
      "creador": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Juan Pérez",
        "email": "juan@espe.edu.ec",
        "avatarUrl": "https://storage.googleapis.com/..."
      }
    }
  }
}
```

**Errores Posibles:**

- `400 Bad Request`: 
  - Campos requeridos faltantes
  - Categoría inválida
  - Formato de fecha inválido
  - fechaFin anterior a fechaInicio
  - Precio negativo
  - Archivo de imagen inválido
- `401 Unauthorized`: Token no proporcionado o inválido
- `500 Internal Server Error`: Error al subir imagen a Google Cloud Storage

---

### 4. Editar un Evento

Actualiza un evento existente. Solo el creador del evento puede editarlo.

**Endpoint:** `PUT /api/events/:id`

**Content-Type:** `multipart/form-data`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string (UUID) | ID del evento |

**Body Parameters:**

Todos los parámetros son opcionales. Solo envía los campos que deseas actualizar.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| nombre | string | No | Nuevo nombre |
| descripcion | string | No | Nueva descripción |
| categoria | string | No | Nueva categoría |
| fechaInicio | string (ISO 8601) | No | Nueva fecha de inicio |
| fechaFin | string (ISO 8601) | No | Nueva fecha de fin (puede ser null) |
| ubicacion | string | No | Nueva ubicación |
| precio | number | No | Nuevo precio |
| image | File | No | Nueva imagen (reemplaza la anterior) |

**Ejemplo de Request:**

```javascript
const formData = new FormData();
formData.append('nombre', 'Fiesta de Graduación Actualizada');
formData.append('precio', '30.00');

const response = await fetch(`https://camplus.vercel.app/api/events/${eventId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});
```

**Ejemplo de Response (200 OK):**

```json
{
  "status": "success",
  "message": "Event updated successfully",
  "data": {
    "event": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "nombre": "Fiesta de Graduación Actualizada",
      "descripcion": "Celebración de fin de carrera",
      "categoria": "SOCIAL",
      "fechaInicio": "2024-12-15T18:00:00.000Z",
      "fechaFin": "2024-12-15T23:00:00.000Z",
      "ubicacion": "Auditorio Principal ESPE",
      "precio": 30.00,
      "creadoPor": "123e4567-e89b-12d3-a456-426614174000",
      "imagen": "https://storage.googleapis.com/espe-connect/events/...",
      "createdAt": "2024-11-10T10:00:00.000Z",
      "updatedAt": "2024-11-10T11:30:00.000Z",
      "asistentesCount": 45,
      "isAttending": false,
      "creador": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Juan Pérez",
        "email": "juan@espe.edu.ec",
        "avatarUrl": "https://storage.googleapis.com/..."
      }
    }
  }
}
```

**Errores Posibles:**

- `400 Bad Request`: Datos inválidos (mismos que en crear)
- `401 Unauthorized`: Token no proporcionado o inválido
- `403 Forbidden`: No eres el creador del evento
- `404 Not Found`: Evento no encontrado

---

### 5. Eliminar un Evento

Elimina un evento. Solo el creador del evento puede eliminarlo. Esto también eliminará todas las asistencias asociadas.

**Endpoint:** `DELETE /api/events/:id`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string (UUID) | ID del evento |

**Ejemplo de Request:**

```javascript
const response = await fetch(`https://camplus.vercel.app/api/events/${eventId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Ejemplo de Response (200 OK):**

```json
{
  "status": "success",
  "message": "Event deleted successfully"
}
```

**Errores Posibles:**

- `401 Unauthorized`: Token no proporcionado o inválido
- `403 Forbidden`: No eres el creador del evento
- `404 Not Found`: Evento no encontrado

---

### 6. Confirmar Asistencia a un Evento

Registra la asistencia del usuario autenticado a un evento.

**Endpoint:** `POST /api/events/:id/attend`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string (UUID) | ID del evento |

**Ejemplo de Request:**

```javascript
const response = await fetch(`https://camplus.vercel.app/api/events/${eventId}/attend`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Ejemplo de Response (201 Created):**

```json
{
  "status": "success",
  "message": "Attendance confirmed successfully"
}
```

**Errores Posibles:**

- `400 Bad Request`: Ya estás asistiendo a este evento
- `401 Unauthorized`: Token no proporcionado o inválido
- `404 Not Found`: Evento no encontrado

---

### 7. Cancelar Asistencia a un Evento

Cancela la asistencia del usuario autenticado a un evento.

**Endpoint:** `DELETE /api/events/:id/attend`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string (UUID) | ID del evento |

**Ejemplo de Request:**

```javascript
const response = await fetch(`https://camplus.vercel.app/api/events/${eventId}/attend`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Ejemplo de Response (200 OK):**

```json
{
  "status": "success",
  "message": "Attendance cancelled successfully"
}
```

**Errores Posibles:**

- `401 Unauthorized`: Token no proporcionado o inválido
- `404 Not Found`: Evento no encontrado o no estás asistiendo a este evento

---

### 8. Listar Asistentes de un Evento

Obtiene la lista paginada de usuarios que están asistiendo a un evento.

**Endpoint:** `GET /api/events/:id/attendees`

**Path Parameters:**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string (UUID) | ID del evento |

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| page | number | No | Número de página (default: 1) |
| limit | number | No | Asistentes por página (default: 20) |

**Ejemplo de Request:**

```http
GET /api/events/550e8400-e29b-41d4-a716-446655440000/attendees?page=1&limit=20
Authorization: Bearer <token>
```

**Ejemplo de Response (200 OK):**

```json
{
  "status": "success",
  "data": {
    "attendees": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "María González",
        "email": "maria@espe.edu.ec",
        "avatarUrl": "https://storage.googleapis.com/...",
        "career": "Ingeniería en Sistemas",
        "attendedAt": "2024-11-10T10:15:00.000Z"
      },
      {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "name": "Carlos Rodríguez",
        "email": "carlos@espe.edu.ec",
        "avatarUrl": null,
        "career": "Ingeniería Industrial",
        "attendedAt": "2024-11-10T10:20:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

**Errores Posibles:**

- `401 Unauthorized`: Token no proporcionado o inválido
- `404 Not Found`: Evento no encontrado

---

## Formato de Fechas

Todas las fechas deben estar en formato **ISO 8601**:

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

Ejemplos:
- `2024-12-15T18:00:00.000Z`
- `2024-12-15T18:00:00Z`
- `2024-12-15T18:00:00+00:00`

## Manejo de Imágenes

### Subida de Imágenes

- **Formato aceptado:** JPEG, PNG, GIF, WebP
- **Tamaño máximo:** Configurado en el servidor (típicamente 5-10MB)
- **Campo en FormData:** `image`
- **Almacenamiento:** Google Cloud Storage
- **URL pública:** Se devuelve automáticamente en el campo `imagen` del evento

### Ejemplo de Subida (React Native):

```javascript
import * as ImagePicker from 'expo-image-picker';

// Seleccionar imagen
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  quality: 0.8
});

if (!result.canceled) {
  const formData = new FormData();
  formData.append('nombre', 'Mi Evento');
  formData.append('descripcion', 'Descripción del evento');
  formData.append('categoria', 'SOCIAL');
  formData.append('fechaInicio', new Date().toISOString());
  formData.append('ubicacion', 'ESPE');
  formData.append('precio', '0');
  
  formData.append('image', {
    uri: result.assets[0].uri,
    type: 'image/jpeg',
    name: 'event.jpg'
  });
  
  // Enviar al servidor...
}
```

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Datos inválidos o faltantes |
| 401 | Unauthorized - Token no proporcionado o inválido |
| 403 | Forbidden - No tienes permisos para esta acción |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error - Error del servidor |

## Estructura de Respuestas de Error

Todas las respuestas de error siguen este formato:

```json
{
  "status": "error",
  "message": "Mensaje de error descriptivo",
  "error": "Detalles técnicos del error (solo en desarrollo)"
}
```

## Ejemplos de Implementación

### React Native con Axios

```javascript
import axios from 'axios';

const API_BASE_URL = 'https://camplus.vercel.app/api';

// Configurar axios con interceptor para el token
axios.interceptors.request.use((config) => {
  const token = AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Crear evento
const createEvent = async (eventData, imageUri) => {
  const formData = new FormData();
  formData.append('nombre', eventData.nombre);
  formData.append('descripcion', eventData.descripcion);
  formData.append('categoria', eventData.categoria);
  formData.append('fechaInicio', eventData.fechaInicio);
  formData.append('fechaFin', eventData.fechaFin || '');
  formData.append('ubicacion', eventData.ubicacion);
  formData.append('precio', eventData.precio.toString());
  
  if (imageUri) {
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'event.jpg'
    });
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/events`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error.response?.data);
    throw error;
  }
};

// Obtener eventos
const getEvents = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/events`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error.response?.data);
    throw error;
  }
};

// Confirmar asistencia
const attendEvent = async (eventId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/events/${eventId}/attend`);
    return response.data;
  } catch (error) {
    console.error('Error attending event:', error.response?.data);
    throw error;
  }
};

// Cancelar asistencia
const cancelAttendance = async (eventId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/events/${eventId}/attend`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling attendance:', error.response?.data);
    throw error;
  }
};
```

## Notas Importantes

1. **Autenticación:** Todas las rutas requieren un token JWT válido en el header `Authorization`.

2. **Formato de Fechas:** Siempre usa formato ISO 8601 para las fechas. El backend valida que `fechaFin` sea posterior a `fechaInicio`.

3. **Imágenes:** Las imágenes se suben a Google Cloud Storage y se devuelve una URL pública. Si actualizas la imagen de un evento, la imagen anterior se elimina automáticamente.

4. **Permisos:** Solo el creador de un evento puede editarlo o eliminarlo. Cualquier usuario autenticado puede asistir o cancelar su asistencia.

5. **Paginación:** Los endpoints de listado soportan paginación mediante los parámetros `page` y `limit`.

6. **Filtros:** El filtro de `ubicacion` realiza una búsqueda parcial (case-insensitive), por lo que puedes buscar por palabras clave.

7. **Asistencias:** Un usuario solo puede asistir una vez a cada evento. Si intenta confirmar asistencia dos veces, recibirá un error 400.

8. **Eliminación en Cascada:** Si se elimina un evento, todas las asistencias asociadas se eliminan automáticamente.

## Soporte

Para más información o reportar problemas, consulta la documentación Swagger en:
```
https://camplus.vercel.app/api-docs
```

