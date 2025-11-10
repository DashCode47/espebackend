# Google Cloud Storage Setup Guide

Esta guía te ayudará a configurar Google Cloud Storage para subir imágenes de posts.

## 📋 Prerrequisitos

1. Una cuenta de Google Cloud Platform
2. Un proyecto de Google Cloud creado
3. Un bucket de Google Cloud Storage creado

## 🚀 Pasos de Configuración

### 1. Crear un Bucket en Google Cloud Storage

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Navega a **Cloud Storage** → **Buckets**
3. Haz clic en **Create Bucket**
4. Configura:
   - **Name**: `especonnect-images` (o el nombre que prefieras)
   - **Location type**: Regional o Multi-regional
   - **Storage class**: Standard
   - **Access control**: Uniform
5. Haz clic en **Create**

### 2. Crear una Service Account

1. Ve a **IAM & Admin** → **Service Accounts**
2. Haz clic en **Create Service Account**
3. Completa:
   - **Service account name**: `especonnect-storage`
   - **Service account ID**: Se genera automáticamente
4. Haz clic en **Create and Continue**
5. Asigna el rol: **Storage Admin** (o **Storage Object Admin** para más seguridad)
6. Haz clic en **Done**

### 3. Crear y Descargar la Key

1. En la lista de Service Accounts, haz clic en la que acabas de crear
2. Ve a la pestaña **Keys**
3. Haz clic en **Add Key** → **Create new key**
4. Selecciona **JSON**
5. Haz clic en **Create** (se descargará un archivo JSON)

### 4. Configurar Permisos del Bucket

1. Ve a tu bucket en Cloud Storage
2. Haz clic en **Permissions**
3. Haz clic en **Grant Access**
4. Agrega tu Service Account con el rol **Storage Object Admin**
5. Guarda los cambios

### 5. Configurar Variables de Entorno

Tienes dos opciones para configurar las credenciales:

#### Opción A: Usar archivo de credenciales (Desarrollo local)

1. Guarda el archivo JSON descargado en tu proyecto (ej: `gcs-credentials.json`)
2. Agrega a `.env`:
   ```env
   GCS_PROJECT_ID=tu-project-id
   GCS_BUCKET_NAME=especonnect-images
   GCS_KEY_FILENAME=./gcs-credentials.json
   ```

#### Opción B: Usar credenciales como variable de entorno (Vercel/Producción)

1. Abre el archivo JSON descargado
2. Copia todo el contenido del JSON
3. En Vercel, ve a **Settings** → **Environment Variables**
4. Agrega:
   - `GCS_PROJECT_ID`: Tu Project ID de Google Cloud
   - `GCS_BUCKET_NAME`: `especonnect-images` (o el nombre de tu bucket)
   - `GCS_CREDENTIALS`: Pega el contenido completo del JSON (como string)

**⚠️ Importante**: Para Vercel, usa la Opción B. El archivo JSON no estará disponible en el servidor.

## 📝 Variables de Entorno Requeridas

```env
# Google Cloud Storage
GCS_PROJECT_ID=tu-project-id
GCS_BUCKET_NAME=especonnect-images
GCS_KEY_FILENAME=./gcs-credentials.json  # Solo para desarrollo local
# O
GCS_CREDENTIALS={"type":"service_account",...}  # Para producción (Vercel)
```

## 🔧 Configuración del Bucket para Acceso Público

Para que las imágenes sean accesibles públicamente:

1. Ve a tu bucket → **Permissions**
2. Haz clic en **Add Principal**
3. Agrega `allUsers` con el rol **Storage Object Viewer**
4. Esto permite que cualquiera pueda ver las imágenes (pero no modificarlas)

**Alternativa más segura**: Usa signed URLs en lugar de hacer el bucket público.

## ✅ Verificación

Una vez configurado, prueba subir una imagen:

```bash
POST /api/posts
Content-Type: multipart/form-data

{
  "type": "CONFESSION",
  "content": "Test post",
  "image": [archivo de imagen]
}
```

La respuesta debería incluir `imageUrl` con una URL de Google Cloud Storage.

## 🛠️ Troubleshooting

### Error: "GCS_BUCKET_NAME is not configured"
- Verifica que la variable de entorno `GCS_BUCKET_NAME` esté configurada

### Error: "Failed to upload image to Google Cloud Storage"
- Verifica que las credenciales sean correctas
- Verifica que el Service Account tenga permisos en el bucket
- Verifica que el bucket exista

### Error: "Access Denied"
- Verifica los permisos del Service Account
- Verifica que el bucket tenga los permisos correctos

## 📚 Recursos

- [Google Cloud Storage Documentation](https://cloud.google.com/storage/docs)
- [@google-cloud/storage npm package](https://www.npmjs.com/package/@google-cloud/storage)

