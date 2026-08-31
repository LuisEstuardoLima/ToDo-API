# Todo API

API REST sencilla de gestión de tareas (To-Do), construida con **Node.js + Express**.
Permite **crear, listar, consultar, actualizar y eliminar** tareas. Los datos se
guardan en memoria (se reinician al detener el proceso), lo cual es suficiente
para el alcance de este reto.

## Endpoints

| Método | Ruta          | Descripción                                  |
|--------|---------------|-----------------------------------------------|
| GET    | `/health`     | Chequeo de salud del servicio                 |
| GET    | `/tasks`      | Lista todas las tareas                        |
| GET    | `/tasks/:id`  | Obtiene una tarea por id                      |
| POST   | `/tasks`      | Crea una tarea (`title` requerido)            |
| PUT    | `/tasks/:id`  | Actualiza `title`, `description` y/o `done`   |
| DELETE | `/tasks/:id`  | Elimina una tarea                             |

### Ejemplo de body para crear una tarea

```json
{
  "title": "Comprar pan",
  "description": "Ir a la panadería antes de las 6pm",
  "done": false
}
```

## Ejecutar localmente (sin Docker)

Requiere Node.js 20+.

```bash
npm install
npm start
```

La API quedará disponible en `http://localhost:8080`.

Para correr las pruebas:

```bash
npm test
```

### Probar rápido con curl

```bash
curl -X POST http://localhost:8080/tasks -H "Content-Type: application/json" -d '{"title":"Comprar pan"}'
curl http://localhost:8080/tasks
```

## Ejecutar con Docker

Construir la imagen:

```bash
docker build -t luislima86/todo-api:1.0 .
```

Ejecutar el contenedor:

```bash
docker run --rm -p 8080:8080 luislima86/todo-api:1.0
```

Verificar que responde:

```bash
curl http://localhost:8080/health
```

## Análisis de calidad con SonarQube / SonarCloud

1. Generar un token en SonarCloud (o levantar SonarQube local).
2. Ejecutar el scanner apuntando a este proyecto (usa `sonar-project.properties`
   incluido):

```bash
sonar-scanner \
  -Dsonar.projectKey=todo-api \
  -Dsonar.organization=<tu-organizacion> \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.login=<tu-token>
```

3. Repositorio analizado: `LuisEstuardoLima/ToDo-API` en SonarCloud, usando
   "Automatic Analysis" (sin necesidad de correr el scanner localmente).
4. **Resultado del primer análisis:** Quality Gate "Sonar way" — Reliability A
   (0 issues), Maintainability A (0 issues), **Security D (3 issues abiertos,
   todos en el `Dockerfile`)**, 0.0% de duplicaciones.
5. **Resultado tras las correcciones:** Quality Gate **Passed**. 0 issues
   nuevos, 0 hallazgos aceptados sin corregir, 0 security hotspots.

## Escaneo de seguridad con Trivy

```bash
trivy image luislima86/todo-api:1.0
```

Guardar la salida (texto o captura) como evidencia, por ejemplo:

```bash
trivy image luislima86/todo-api:1.0 > evidencias/trivy-scan.txt
```

## Publicar en Docker Hub

```bash
docker login
docker tag todo-api:1.0 luislima86/todo-api:1.0
docker push luislima86/todo-api:1.0
```

**URL pública de la imagen:**
[`https://hub.docker.com/r/luislima86/todo-api`](https://hub.docker.com/r/luislima86/todo-api)

```bash
docker pull luislima86/todo-api:1.0
```

## Prompts utilizados con IA

Registro de los prompts usados como apoyo durante el desarrollo (ajustar a los
que realmente se utilicen; estos son un ejemplo representativo del flujo
seguido):

1. **"Ayúdame a crear una API REST sencilla de tareas en Node.js. Debe tener
   crear, listar, actualizar y eliminar. Explícame la estructura antes de
   generar código."**
   → Aporte: propuesta de estructura de carpetas (`src/app.js`, `src/index.js`,
   `src/taskStore.js`) separando rutas, arranque del servidor y almacenamiento,
   antes de escribir cualquier línea de código.

2. **"Revisa este código y dime qué problemas de calidad podría detectar
   Sonar. No lo reescribas completo; explícame primero los problemas."**
   → Aporte: identificó falta de validación de entradas en `POST`/`PUT` y
   ausencia de manejo de rutas no encontradas, antes de correr Sonar.

3. **"Genera un Dockerfile sencillo y seguro para esta aplicación. Explícame
   cada instrucción."**
   → Aporte: uso de imagen base `alpine`, instalación solo de dependencias de
   producción, creación de un usuario no root, y explicación de por qué cada
   capa se ordena así para aprovechar la cache de Docker.

4. **"Trivy reporta esta vulnerabilidad: [pegar hallazgo]. Explícame el riesgo
   y una forma segura de corregirla."**
   → Aporte: explicación del riesgo real de la CVE y sugerencia de actualizar
   el tag de la imagen base o la dependencia afectada, en lugar de ignorar el
   hallazgo.

5. **"Revisa mi README y dime si otra persona podría ejecutar la aplicación
   siguiendo únicamente esas instrucciones."**
   → Aporte: detectó que faltaban los comandos exactos de `curl` para probar
   la API y los pasos de Docker Hub, que ya se incorporaron arriba.
