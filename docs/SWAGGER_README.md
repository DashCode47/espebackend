# Documentación Swagger - ESPEConnect API

## 📖 Descripción

Esta documentación proporciona una interfaz interactiva para explorar y probar todos los endpoints de la API de ESPEConnect. La documentación está generada automáticamente usando Swagger/OpenAPI 3.0.

## 🚀 Acceso a la Documentación

Una vez que el servidor esté corriendo, puedes acceder a la documentación Swagger en:

```
http://localhost:3000/api-docs
```

## 📋 Endpoints Documentados

### 🔐 Autenticación
- **POST** `/api/auth/register` - Registrar un nuevo usuario
- **POST** `/api/auth/login` - Iniciar sesión

### 👥 Usuarios
- **GET** `/api/users/profile` - Obtener perfil del usuario autenticado
- **PUT** `/api/users/profile` - Actualizar perfil del usuario
- **GET** `/api/users/all-users` - Obtener todos los usuarios
- **GET** `/api/users/potential-matches` - Obtener usuarios potenciales para matching

### 💕 Matching
- **POST** `/api/matches/like/{targetUserId}` - Dar like a un usuario
- **GET** `/api/matches/matches` - Obtener todos los matches del usuario
- **GET** `/api/matches/check/{targetUserId}` - Verificar si hay match con un usuario

### 📝 Posts
- **POST** `/api/posts` - Crear un nuevo post
- **GET** `/api/posts` - Obtener todos los posts
- **GET** `/api/posts/{postId}` - Obtener un post específico
- **PUT** `/api/posts/{postId}` - Actualizar un post
- **POST** `/api/posts/{postId}/react` - Reaccionar a un post

### 💬 Comentarios
- **POST** `/api/posts/{postId}/comments` - Crear un comentario en un post
- **GET** `/api/posts/{postId}/comments` - Obtener comentarios de un post

### 🔔 Notificaciones
- **GET** `/api/notifications` - Obtener notificaciones del usuario
- **PUT** `/api/notifications/{notificationId}/read` - Marcar una notificación como leída
- **PUT** `/api/notifications/read-all` - Marcar todas las notificaciones como leídas

### 🎉 Promociones
- **GET** `/api/promotions` - Obtener todas las promociones (público)
- **GET** `/api/promotions/category/{category}` - Obtener promociones por categoría (público)
- **GET** `/api/promotions/{promotionId}` - Obtener una promoción específica (público)
- **POST** `/api/promotions` - Crear una nueva promoción (requiere autenticación)
- **PUT** `/api/promotions/{promotionId}` - Actualizar una promoción (requiere autenticación)
- **DELETE** `/api/promotions/{promotionId}` - Eliminar una promoción (requiere autenticación)

### 🎨 Banners
- **POST** `/api/banners` - Crear un nuevo banner
- **GET** `/api/banners` - Obtener todos los banners
- **GET** `/api/banners/{id}` - Obtener un banner específico
- **PUT** `/api/banners/{id}` - Actualizar un banner
- **DELETE** `/api/banners/{id}` - Eliminar un banner

## 🔑 Autenticación

La mayoría de endpoints requieren autenticación mediante JWT Bearer Token. Para usar estos endpoints:

1. Primero registra un usuario o inicia sesión usando los endpoints de autenticación
2. Copia el token JWT de la respuesta
3. En Swagger UI, haz clic en el botón "Authorize" (🔒)
4. Ingresa el token en el formato: `Bearer tu_token_aqui`
5. Haz clic en "Authorize"

## 🧪 Probar Endpoints

### Pasos para probar:

1. **Abrir la documentación**: Ve a `http://localhost:3000/api-docs`

2. **Autenticarse**: 
   - Usa el endpoint de login/register para obtener un token
   - Haz clic en "Authorize" y agrega el token

3. **Probar endpoints**:
   - Expande cualquier endpoint que quieras probar
   - Haz clic en "Try it out"
   - Completa los parámetros requeridos
   - Haz clic en "Execute"

4. **Ver respuestas**: 
   - La respuesta se mostrará en la sección "Responses"
   - Puedes ver el código de estado, headers y body de la respuesta

## 📊 Códigos de Estado

- **200** - Éxito
- **201** - Creado exitosamente
- **400** - Datos inválidos
- **401** - No autorizado
- **403** - Prohibido
- **404** - No encontrado
- **409** - Conflicto (ej: email ya registrado)
- **500** - Error interno del servidor

## 🔧 Configuración

La documentación Swagger está configurada en:
- **Archivo de configuración**: `src/config/swagger.ts`
- **Integración**: `src/index.ts`
- **Documentación de rutas**: Cada archivo en `src/routes/`

## 📝 Notas Importantes

- Los endpoints públicos (como obtener promociones) no requieren autenticación
- Los endpoints protegidos requieren el header `Authorization: Bearer <token>`
- Algunos endpoints soportan paginación con parámetros `page` y `limit`
- Los archivos de imagen deben ser URLs válidas
- Las fechas deben estar en formato ISO 8601

## 🐛 Solución de Problemas

### Error 401 (No autorizado)
- Verifica que el token JWT sea válido
- Asegúrate de que el token no haya expirado
- Revisa que el formato sea `Bearer <token>`

### Error 400 (Datos inválidos)
- Verifica que todos los campos requeridos estén presentes
- Revisa el formato de los datos (email, fechas, etc.)
- Asegúrate de que los tipos de datos sean correctos

### Error 404 (No encontrado)
- Verifica que el ID del recurso sea correcto
- Asegúrate de que el recurso exista en la base de datos

## 📞 Soporte

Si tienes problemas con la documentación o la API, contacta al equipo de desarrollo de ESPEConnect. 