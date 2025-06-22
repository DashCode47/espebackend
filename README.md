# ESPEConnect Backend

Backend API para ESPEConnect - Red social para estudiantes de la ESPE (Escuela Superior Politécnica del Ejército).

## 📋 Descripción

ESPEConnect es una plataforma social diseñada específicamente para estudiantes de la ESPE, permitiendo la conexión, interacción y colaboración entre miembros de la comunidad estudiantil.

## 🚀 Características

- **Autenticación de usuarios** con JWT
- **Gestión de perfiles** de estudiantes
- **Sistema de matches** para conectar estudiantes
- **Publicaciones y posts** para compartir contenido
- **Sistema de notificaciones** en tiempo real
- **Gestión de promociones** y banners
- **API RESTful** con Express.js
- **Base de datos** con Prisma ORM
- **TypeScript** para mayor seguridad de tipos

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **TypeScript** - Lenguaje de programación
- **Prisma** - ORM para base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **CORS** - Cross-Origin Resource Sharing

## 📦 Instalación

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn
- Base de datos (PostgreSQL recomendado)

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/DashCode47/espebackend.git
   cd espebackend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/especonnect"
   JWT_SECRET="tu_jwt_secret_aqui"
   PORT=3000
   ```

4. **Configurar la base de datos**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

## 🏃‍♂️ Scripts Disponibles

- `npm run dev` - Ejecuta el servidor en modo desarrollo con hot reload
- `npm run build` - Compila el proyecto TypeScript
- `npm run start` - Ejecuta el servidor en producción
- `npm run prisma:generate` - Genera el cliente Prisma
- `npm run prisma:migrate` - Ejecuta las migraciones de la base de datos
- `npm run prisma:studio` - Abre Prisma Studio para gestionar la base de datos

## 📚 Estructura del Proyecto

```
src/
├── auth/           # Lógica de autenticación
├── controllers/    # Controladores de la API
├── middlewares/    # Middlewares personalizados
├── routes/         # Definición de rutas
├── services/       # Lógica de negocio
├── utils/          # Utilidades y helpers
└── index.ts        # Punto de entrada de la aplicación

prisma/
├── migrations/     # Migraciones de la base de datos
└── schema.prisma   # Esquema de la base de datos
```

## 🔌 Endpoints de la API

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Obtener lista de usuarios
- `GET /api/users/:id` - Obtener usuario específico
- `PUT /api/users/:id` - Actualizar perfil de usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Matches
- `GET /api/matches` - Obtener matches del usuario
- `POST /api/matches` - Crear nuevo match
- `PUT /api/matches/:id` - Actualizar estado del match

### Posts
- `GET /api/posts` - Obtener posts
- `POST /api/posts` - Crear nuevo post
- `PUT /api/posts/:id` - Actualizar post
- `DELETE /api/posts/:id` - Eliminar post

### Notificaciones
- `GET /api/notifications` - Obtener notificaciones
- `PUT /api/notifications/:id` - Marcar como leída

### Promociones
- `GET /api/promotions` - Obtener promociones activas
- `POST /api/promotions` - Crear nueva promoción

### Banners
- `GET /api/banners` - Obtener banners
- `POST /api/banners` - Crear nuevo banner

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a endpoints protegidos, incluye el token en el header:

```
Authorization: Bearer <tu_jwt_token>
```

## 🗄️ Base de Datos

El proyecto utiliza Prisma como ORM. El esquema de la base de datos incluye:

- **Users** - Información de usuarios/estudiantes
- **Posts** - Publicaciones de usuarios
- **Matches** - Conexiones entre usuarios
- **Notifications** - Notificaciones del sistema
- **Promotions** - Promociones y eventos
- **Banners** - Banners promocionales

## 🚀 Despliegue

### Variables de entorno para producción

```env
NODE_ENV=production
DATABASE_URL="tu_url_de_base_de_datos_produccion"
JWT_SECRET="tu_jwt_secret_seguro"
PORT=3000
```

### Comandos de despliegue

```bash
npm run build
npm run start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **DashCode47** - *Desarrollo inicial* - [GitHub](https://github.com/DashCode47)

## 🙏 Agradecimientos

- Comunidad ESPE por el apoyo y feedback
- Contribuidores del proyecto
- Tecnologías open source utilizadas

---

**ESPEConnect** - Conectando estudiantes ESPE desde 2024 🎓 