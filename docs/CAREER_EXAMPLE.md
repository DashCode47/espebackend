# Ejemplo de Carrera: Ingeniería en Biotecnología

## Endpoint
- **URL**: `/api/careers/code/BIOTEC`
- **Método**: GET
- **Autenticación**: Bearer Token requerido

## Respuesta JSON Esperada

```json
{
  "status": "success",
  "data": {
    "career": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "BIOTEC",
      "name": "Ingeniería en Biotecnología",
      "modality": "Presencial",
      "duration": 10,
      "schedule": "Matutina",
      "campus": "Sangolquí",
      "cesResolution": "RPC-SO-18-No. 001-2023",
      "directorName": "Dra. María Elena González",
      "directorEmail": "maria.gonzalez@espe.edu.ec",
      "accreditations": [
        "Acreditación CEAACES 2019-2025",
        "Certificación ISO 9001:2015"
      ],
      "mission": "Formar profesionales en Ingeniería en Biotecnología con sólidos conocimientos científicos y tecnológicos, capaces de aplicar principios biológicos y tecnológicos para el desarrollo de soluciones innovadoras en áreas como la salud, agricultura, medio ambiente e industria, contribuyendo al desarrollo sostenible del país.",
      "vision": "Ser reconocida como una carrera líder en la formación de ingenieros biotecnólogos, con estándares internacionales de calidad, que genere investigación de vanguardia y contribuya significativamente al desarrollo tecnológico y científico del Ecuador.",
      "objectives": [
        "Formar profesionales con competencias técnicas y científicas en biotecnología",
        "Desarrollar capacidades de investigación e innovación tecnológica",
        "Promover la aplicación de la biotecnología para el desarrollo sostenible",
        "Fomentar la colaboración con instituciones nacionales e internacionales",
        "Contribuir al desarrollo de la industria biotecnológica del país"
      ],
      "graduateProfile": "El egresado de Ingeniería en Biotecnología será un profesional con formación integral, capaz de aplicar conocimientos científicos y tecnológicos para resolver problemas complejos en el campo de la biotecnología, con habilidades de liderazgo, trabajo en equipo y compromiso con la sociedad.",
      "professionalProfile": "El ingeniero biotecnólogo podrá desempeñarse en áreas como: investigación y desarrollo en biotecnología, producción de biofármacos, control de calidad en industrias biotecnológicas, gestión de proyectos biotecnológicos, consultoría técnica, docencia universitaria, y emprendimiento en el sector biotecnológico.",
      "curriculumPdfUrl": "https://espe.edu.ec/carreras/biotecnologia/malla-curricular.pdf",
      "curriculumDescription": "La malla curricular está estructurada en 10 semestres, con un total de 240 créditos. Incluye asignaturas de formación básica en ciencias, formación profesional específica en biotecnología, y formación complementaria en humanidades y gestión empresarial.",
      "subjects": [
        "Matemáticas I",
        "Física I",
        "Química General",
        "Biología Celular",
        "Programación",
        "Estadística",
        "Microbiología",
        "Bioquímica",
        "Genética",
        "Biotecnología Vegetal",
        "Biotecnología Animal",
        "Biotecnología Microbiana",
        "Biotecnología Ambiental",
        "Biotecnología Industrial",
        "Bioinformática",
        "Gestión de Proyectos",
        "Emprendimiento",
        "Trabajo de Titulación"
      ],
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

## Estructura de la Base de Datos

### Modelo Career (Prisma Schema)

```prisma
model Career {
  id                    String   @id @default(uuid())
  code                  String   @unique
  name                  String
  modality              String   // Presencial, Semipresencial, Virtual
  duration              Int      // Duración en semestres
  schedule              String   // Matutina, Vespertina, Nocturna
  campus                String
  cesResolution         String   // Resolución del CES
  directorName          String
  directorEmail         String
  accreditations        String[] // Array de acreditaciones
  mission               String
  vision                String
  objectives            String[]
  graduateProfile       String   // Perfil de egreso general
  professionalProfile   String   // Perfil de egreso profesional
  curriculumPdfUrl      String?  // URL del PDF de la malla curricular
  curriculumDescription String   // Descripción de la malla curricular
  subjects              String[] // Lista de asignaturas
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

## Endpoints Disponibles

### 1. Crear Carrera
- **POST** `/api/careers`
- **Descripción**: Crear una nueva carrera universitaria
- **Autenticación**: Requerida

### 2. Obtener Todas las Carreras
- **GET** `/api/careers`
- **Descripción**: Obtener lista de carreras con filtros y paginación
- **Parámetros de consulta**: `modality`, `campus`, `schedule`, `isActive`, `page`, `limit`
- **Autenticación**: Requerida

### 3. Obtener Carrera por ID
- **GET** `/api/careers/{careerId}`
- **Descripción**: Obtener una carrera específica por su ID
- **Autenticación**: Requerida

### 4. Obtener Carrera por Código
- **GET** `/api/careers/code/{code}`
- **Descripción**: Obtener una carrera por su código único
- **Autenticación**: Requerida

### 5. Actualizar Carrera
- **PUT** `/api/careers/{careerId}`
- **Descripción**: Actualizar información de una carrera existente
- **Autenticación**: Requerida

### 6. Eliminar Carrera
- **DELETE** `/api/careers/{careerId}`
- **Descripción**: Eliminar una carrera (soft delete)
- **Autenticación**: Requerida

### 7. Obtener Carreras por Campus
- **GET** `/api/careers/campus/{campus}`
- **Descripción**: Obtener carreras de un campus específico
- **Parámetros de consulta**: `page`, `limit`
- **Autenticación**: Requerida

### 8. Obtener Carreras por Modalidad
- **GET** `/api/careers/modality/{modality}`
- **Descripción**: Obtener carreras por modalidad de estudio
- **Parámetros de consulta**: `page`, `limit`
- **Autenticación**: Requerida

## Filtros Disponibles

- **Modalidad**: Presencial, Semipresencial, Virtual
- **Campus**: Sangolquí, Latacunga, Santo Domingo, etc.
- **Jornada**: Matutina, Vespertina, Nocturna
- **Estado**: Activo/Inactivo

## Paginación

Todos los endpoints que retornan listas incluyen paginación con los siguientes parámetros:
- `page`: Número de página (por defecto: 1)
- `limit`: Elementos por página (por defecto: 10)

La respuesta incluye información de paginación:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## Validaciones

- **Código**: Debe ser único en el sistema
- **Duración**: Entre 1 y 20 semestres
- **Email del director**: Formato de email válido
- **Campos requeridos**: Todos los campos marcados como obligatorios deben ser proporcionados
