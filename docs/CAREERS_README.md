# Módulo de Carreras Universitarias - ESPEConnect

## Descripción

Este módulo proporciona una API completa para gestionar información de carreras universitarias de la Universidad de las Fuerzas Armadas - ESPE. Permite crear, consultar, actualizar y eliminar información detallada de cada carrera, incluyendo datos académicos, administrativos y curriculares.

## Características Principales

- **Gestión Completa de Carreras**: CRUD completo para carreras universitarias
- **Información Detallada**: Incluye misión, visión, objetivos, perfiles de egreso, malla curricular
- **Filtros Avanzados**: Búsqueda por modalidad, campus, jornada y estado
- **Paginación**: Soporte para listas paginadas
- **Validaciones**: Validación de datos y formatos
- **Autenticación**: Todas las operaciones requieren autenticación
- **Documentación Swagger**: API completamente documentada

## Estructura del Proyecto

```
src/
├── controllers/
│   └── career.controller.ts    # Controlador principal de carreras
├── routes/
│   └── career.routes.ts        # Definición de rutas y Swagger
├── prisma/
│   └── schema.prisma           # Modelo de base de datos
└── docs/
    ├── CAREER_EXAMPLE.md       # Ejemplo de respuesta JSON
    ├── BIOTEC_INSERT.sql       # Script SQL de ejemplo
    └── CAREERS_README.md       # Este archivo
```

## Instalación y Configuración

### 1. Actualizar el Esquema de Prisma

El modelo `Career` ya ha sido agregado al esquema de Prisma. Ejecuta la migración:

```bash
npx prisma migrate dev --name add_career_model
```

### 2. Generar el Cliente de Prisma

```bash
npx prisma generate
```

### 3. Insertar Datos de Ejemplo

Ejecuta el script SQL de ejemplo para probar la funcionalidad:

```bash
psql -d tu_base_de_datos -f docs/BIOTEC_INSERT.sql
```

## Endpoints Disponibles

### Base URL: `/api/careers`

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | `/` | Crear nueva carrera | ✅ Requerida |
| GET | `/` | Listar todas las carreras | ✅ Requerida |
| GET | `/{careerId}` | Obtener carrera por ID | ✅ Requerida |
| GET | `/code/{code}` | Obtener carrera por código | ✅ Requerida |
| PUT | `/{careerId}` | Actualizar carrera | ✅ Requerida |
| DELETE | `/{careerId}` | Eliminar carrera | ✅ Requerida |
| GET | `/campus/{campus}` | Carreras por campus | ✅ Requerida |
| GET | `/modality/{modality}` | Carreras por modalidad | ✅ Requerida |

## Modelo de Datos

### Campos Principales

- **Identificación**: `id`, `code`, `name`
- **Características**: `modality`, `duration`, `schedule`, `campus`
- **Administrativo**: `cesResolution`, `directorName`, `directorEmail`
- **Acreditación**: `accreditations[]`
- **Institucional**: `mission`, `vision`, `objectives[]`
- **Perfiles**: `graduateProfile`, `professionalProfile`
- **Curricular**: `curriculumPdfUrl`, `curriculumDescription`, `subjects[]`
- **Estado**: `isActive`, `createdAt`, `updatedAt`

### Tipos de Datos

- **Modalidad**: Presencial, Semipresencial, Virtual
- **Jornada**: Matutina, Vespertina, Nocturna
- **Duración**: 1-20 semestres
- **Arrays**: `accreditations`, `objectives`, `subjects`

## Ejemplo de Uso

### Crear una Nueva Carrera

```bash
curl -X POST http://localhost:3000/api/careers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BIOTEC",
    "name": "Ingeniería en Biotecnología",
    "modality": "Presencial",
    "duration": 10,
    "schedule": "Matutina",
    "campus": "Sangolquí",
    "cesResolution": "RPC-SO-18-No. 001-2023",
    "directorName": "Dra. María Elena González",
    "directorEmail": "maria.gonzalez@espe.edu.ec",
    "accreditations": ["Acreditación CEAACES 2019-2025"],
    "mission": "Formar profesionales en Ingeniería en Biotecnología...",
    "vision": "Ser reconocida como una carrera líder...",
    "objectives": ["Formar profesionales con competencias técnicas..."],
    "graduateProfile": "El egresado será un profesional con formación integral...",
    "professionalProfile": "El ingeniero biotecnólogo podrá desempeñarse en...",
    "curriculumDescription": "Malla curricular estructurada en 10 semestres...",
    "subjects": ["Matemáticas I", "Física I", "Química General"]
  }'
```

### Obtener Carrera por Código

```bash
curl -X GET http://localhost:3000/api/careers/code/BIOTEC \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Filtrar Carreras por Campus

```bash
curl -X GET "http://localhost:3000/api/careers?campus=Sangolquí&modality=Presencial&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Filtros y Paginación

### Parámetros de Consulta

- **`modality`**: Filtrar por modalidad de estudio
- **`campus`**: Filtrar por campus
- **`schedule`**: Filtrar por jornada
- **`isActive`**: Filtrar por estado activo
- **`page`**: Número de página (por defecto: 1)
- **`limit`**: Elementos por página (por defecto: 10)

### Ejemplo de Respuesta Paginada

```json
{
  "status": "success",
  "data": {
    "careers": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

## Validaciones

### Campos Requeridos

Todos los campos marcados como obligatorios en el esquema deben ser proporcionados al crear una carrera.

### Validaciones Específicas

- **`code`**: Debe ser único en el sistema
- **`duration`**: Debe estar entre 1 y 20 semestres
- **`directorEmail`**: Debe tener formato de email válido
- **`modality`**: Debe ser uno de los valores permitidos
- **`schedule`**: Debe ser uno de los valores permitidos

## Manejo de Errores

### Códigos de Estado HTTP

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Datos inválidos o validación fallida
- **401**: No autorizado (token inválido o faltante)
- **404**: Carrera no encontrada
- **500**: Error interno del servidor

### Ejemplo de Error

```json
{
  "status": "error",
  "message": "Career code already exists",
  "statusCode": 400
}
```

## Seguridad

### Autenticación

Todas las operaciones requieren un token JWT válido en el header `Authorization: Bearer <token>`.

### Middleware de Autenticación

El middleware `authMiddleware` se aplica a todas las rutas de carreras para verificar la autenticación del usuario.

## Documentación Swagger

La API está completamente documentada con Swagger y está disponible en:

```
http://localhost:3000/api-docs
```

### Tags de Swagger

- **Careers**: Todas las operaciones relacionadas con carreras

### Esquemas de Swagger

- **Career**: Esquema completo del modelo de carrera
- **Error**: Esquema de respuesta de error

## Pruebas

### Datos de Prueba

El archivo `BIOTEC_INSERT.sql` contiene datos de ejemplo para probar la funcionalidad:

- Ingeniería en Biotecnología (BIOTEC)
- Ingeniería en Sistemas (SISTEMAS)
- Ingeniería Mecánica (MECANICA)

### Casos de Prueba Recomendados

1. **Crear carrera**: Validar todos los campos requeridos
2. **Código duplicado**: Intentar crear carrera con código existente
3. **Validaciones**: Probar campos con valores inválidos
4. **Filtros**: Probar diferentes combinaciones de filtros
5. **Paginación**: Verificar funcionamiento de paginación
6. **Autenticación**: Probar endpoints sin token válido

## Mantenimiento

### Migraciones de Base de Datos

Para agregar nuevos campos o modificar la estructura:

1. Actualizar el esquema de Prisma
2. Crear nueva migración: `npx prisma migrate dev --name description`
3. Aplicar migración: `npx prisma migrate deploy`

### Logs y Monitoreo

El controlador incluye manejo de errores centralizado que registra errores para monitoreo y debugging.

## Contribución

### Estándares de Código

- Seguir la estructura de controladores existentes
- Mantener consistencia en el manejo de errores
- Documentar todas las funciones con JSDoc
- Incluir validaciones apropiadas
- Seguir las convenciones de nomenclatura del proyecto

### Pruebas

- Probar todos los endpoints antes de hacer commit
- Verificar validaciones y manejo de errores
- Probar casos límite y escenarios de error

## Licencia

Este módulo es parte del proyecto ESPEConnect y sigue la misma licencia del proyecto principal.
