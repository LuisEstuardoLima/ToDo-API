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
docker build -t usuario/todo-api:1.0 .
```

Ejecutar el contenedor:

```bash
docker run --rm -p 8080:8080 usuario/todo-api:1.0
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

3. Revisar el dashboard resultante y anexar captura/enlace en la carpeta de
   evidencias (`/evidencias/sonar.png` o enlace público).
4. Documentar aquí, una vez ejecutado, los hallazgos corregidos, por ejemplo:
   - *(completar tras ejecutar el análisis real)*

## Escaneo de seguridad con Trivy

```bash
trivy image usuario/todo-api:1.0
```

Guardar la salida (texto o captura) como evidencia, por ejemplo:

```bash
trivy image usuario/todo-api:1.0 > evidencias/trivy-scan.txt
```

Si aparecen vulnerabilidades `HIGH`/`CRITICAL` corregibles fácilmente (por
ejemplo, actualizando la imagen base `node:20-alpine` a un tag más reciente),
actualizar el `Dockerfile`, reconstruir y volver a escanear.

## Publicar en Docker Hub

```bash
docker login
docker tag usuario/todo-api:1.0 usuario/todo-api:1.0
docker push usuario/todo-api:1.0
```

URL pública de la imagen (completar):
`https://hub.docker.com/r/usuario/todo-api`

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

## Hallazgos de Sonar corregidos (completar con la ejecución real)

- Hallazgo 1: *(descripción)* → corrección aplicada: *(qué se cambió)*
- Hallazgo 2: *(descripción)* → corrección aplicada: *(qué se cambió)*

Si el análisis no reporta hallazgos relevantes, documentarlo explícitamente
aquí en lugar de dejarlo en blanco.

## Reflexión final

Durante este ejercicio, el mayor punto de atención fue la validación de
entradas: sin ella, endpoints como `POST /tasks` aceptaban datos vacíos o mal
formados, algo que tanto una revisión de código como Sonar suelen marcar como
un "code smell" o riesgo de fiabilidad. Corregirlo implicó agregar chequeos
explícitos de tipo y contenido antes de tocar el almacenamiento en memoria.
En el flujo de contenedores, la decisión más relevante fue usar una imagen
base ligera (`node:20-alpine`) y ejecutar el proceso con un usuario no root,
lo que reduce superficie de ataque y suele bajar el número de vulnerabilidades
que reporta Trivy frente a una imagen completa. En general, el flujo
DevSecOps deja claro que la IA acelera la primera versión del código y de la
infraestructura, pero la calidad y la seguridad reales solo se confirman
ejecutando las herramientas (Sonar, Trivy) y entendiendo cada hallazgo antes
de corregirlo, no solo aceptando sugerencias a ciegas.
