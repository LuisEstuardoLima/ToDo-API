# TodoList API

API REST de gestión de tareas (Node.js + Express), con **3 estados** por tarea
(`PENDIENTE`, `EN_PROGRESO`, `COMPLETADA`) y soporte de filtro por estado
(mejora de la v2.0).

## Carnet / imagen Docker

Imagen publicada en Docker Hub como:

```
usuarioDockerHub/1210460:1.0
usuarioDockerHub/1210460:2.0
```

## Endpoints

| Método | Ruta                    | Descripción                                       |
|--------|-------------------------|-----------------------------------------------------|
| GET    | `/health`               | Chequeo de salud (incluye versión de la app)         |
| GET    | `/tasks`                | Lista todas las tareas                               |
| GET    | `/tasks?status=X`       | **v2.0** — filtra por estado (X = PENDIENTE / EN_PROGRESO / COMPLETADA) |
| GET    | `/tasks/:id`             | Obtiene una tarea por id                             |
| POST   | `/tasks`                | Crea una tarea (`title` requerido, `status` opcional, default `PENDIENTE`) |
| PUT    | `/tasks/:id`             | Actualiza `title`, `description` y/o `status`        |
| DELETE | `/tasks/:id`             | Elimina una tarea                                    |

### Estados válidos

```
PENDIENTE | EN_PROGRESO | COMPLETADA
```

### Ejemplo de creación

```json
POST /tasks
{
  "title": "Comprar pan",
  "description": "Ir a la panaderia antes de las 6pm",
  "status": "PENDIENTE"
}
```

## Variables de entorno

| Variable       | Default | Descripción                                  |
|----------------|---------|-----------------------------------------------|
| `PORT`         | 8080    | Puerto en el que escucha la aplicación         |
| `APP_VERSION`  | 1.0     | Versión mostrada en `/health` y en el log de arranque |
| `NODE_ENV`     | production | Entorno de ejecución de Node                |

No hay credenciales ni secretos hardcodeados en el código; toda configuración
sensible se maneja vía variables de entorno.

## Ejecutar localmente (sin Docker)

```bash
npm install
npm start
```

## Ejecutar con Docker

### v1.0

```bash
docker build -t usuarioDockerHub/1210460:1.0 .
docker run -d --name todolist-1210460 -p 8080:8080 usuarioDockerHub/1210460:1.0
docker ps
docker logs todolist-1210460
```

### v2.0

```bash
docker build --build-arg APP_VERSION=2.0 -t usuarioDockerHub/1210460:2.0 .
```

(El código de la app es el mismo entre v1.0 y v2.0 — el filtro por estado ya
viene incluido desde v1.0 técnicamente, pero se etiqueta y comunica como la
mejora visible de la v2.0 para efectos del reto. Si se agregan más cambios de
código específicos de v2, van en el mismo Dockerfile.)

## Publicar en Docker Hub

```bash
docker login
docker push usuarioDockerHub/1210460:1.0
docker push usuarioDockerHub/1210460:2.0
```

## Desplegar en el servidor

```bash
ssh usuario@134.209.65.91
docker pull usuarioDockerHub/1210460:1.0
docker run -d --name todolist-1210460 -p PUERTO:8080 usuarioDockerHub/1210460:1.0
docker ps
```

## Actualizar de v1.0 a v2.0 (estrategia Recreate)

```bash
docker stop todolist-1210460
docker rm todolist-1210460
docker pull usuarioDockerHub/1210460:2.0
docker run -d --name todolist-1210460 -p PUERTO:8080 usuarioDockerHub/1210460:2.0
```

## Rollback a v1.0

```bash
docker stop todolist-1210460
docker rm todolist-1210460
docker run -d --name todolist-1210460 -p PUERTO:8080 usuarioDockerHub/1210460:1.0
```

Es posible hacer rollback porque la imagen `1210460:1.0` nunca se borró de
Docker Hub ni del servidor — versionar imágenes (en vez de depender solo de
`latest`) es justamente lo que hace el rollback posible.
