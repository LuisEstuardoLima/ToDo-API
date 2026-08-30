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

### Resultado del primer escaneo

| Capa | CRITICAL | HIGH | MEDIUM | LOW | Total |
|------|----------|------|--------|-----|-------|
| Alpine (SO) | 0 | 4 | 14 | 32 | 50 |
| Node.js (dependencias empaquetadas) | 1 | 19 | 6 | 2 | 28 |

Al revisar el detalle, los 4 `HIGH` del sistema operativo eran CVEs de
`openssl` (libcrypto3/libssl3) ya corregidos en versiones más nuevas del
paquete Alpine. Los 28 hallazgos de "Node.js" —incluido el único `CRITICAL`,
en `node-tar`— **no pertenecían a la aplicación**: venían de las dependencias
internas del propio CLI de `npm` (`tar`, `glob`, `minimatch`,
`brace-expansion`, `pacote`, `sigstore`, `ip-address`, `diff`,
`@sigstore/core`), incluidas en la imagen base `node:20-alpine` pero
innecesarias en tiempo de ejecución, ya que el contenedor arranca con
`node src/index.js` y no con `npm`.

### Corrección aplicada

Se rediseñó el `Dockerfile` como build multi-stage:
1. Una etapa `deps` que sí usa `npm ci` para instalar dependencias.
2. Una etapa `runtime` final que corre `apk update && apk upgrade` (parches
   de seguridad del SO) y elimina `/usr/local/lib/node_modules/npm` y sus
   binarios, ya que no se usan en producción.

### Resultado tras la corrección

| Capa | CRITICAL | HIGH | MEDIUM | LOW | Total |
|------|----------|------|--------|-----|-------|
| Alpine (SO) | 0 | 0 | 0 | 0 | **0** |
| Node.js | 0 | 0 | 0 | 0 | **0** |

La imagen pasó de **78 vulnerabilidades (1 CRITICAL, 23 HIGH)** a **0**, y
además quedó más liviana (52.2 MB) al no incluir el CLI de `npm` en el
runtime.

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

## Hallazgos de Sonar corregidos

SonarCloud reportó 3 hallazgos de seguridad, los 3 en el `Dockerfile`:

1. **Copiar con patrón glob es sensible a seguridad** (`COPY package.json
   package-lock.json* ./`) → corrección: nombrar los archivos explícitamente
   (`COPY package.json package-lock.json ./`).
2. **Usar dependencias sin fijar versiones resueltas es sensible a
   seguridad** (`npm install`) → corrección: usar `npm ci`, que respeta
   exactamente lo fijado en `package-lock.json`.
3. **Omitir `--ignore-scripts` permite ejecutar scripts de terceros durante
   la instalación** → corrección: agregar `--ignore-scripts` al comando de
   instalación.

Tras el commit con las correcciones, el nuevo análisis mostró **Quality Gate:
Passed**, con 0 issues nuevos y 0 security hotspots.

## Reflexión final

El hallazgo más interesante del reto no estuvo en el código de la aplicación
(Sonar marcó Reliability y Maintainability en A desde el primer análisis),
sino en la imagen Docker: Trivy reportó 78 vulnerabilidades, incluida 1
CRITICAL, pero al revisar el detalle, la mayoría no venían de mi código ni de
`express`, sino de las dependencias internas del propio `npm` empaquetado en
la imagen base (`node-tar`, `glob`, `minimatch`, entre otras). Eso me hizo
entender que un escaneo de imagen no distingue automáticamente "esto es mío"
de "esto vino con el sistema operativo o el runtime"; hay que leer el reporte
con calma antes de decidir qué corregir. La corrección fue rediseñar el
Dockerfile como build multi-stage, quitando `npm` de la imagen final (no se
necesita para ejecutar `node src/index.js`) y actualizando los paquetes del
sistema operativo con `apk upgrade`. Eso bajó el conteo de 78 a 0
vulnerabilidades y, de paso, redujo el tamaño de la imagen. En Sonar, los 3
hallazgos de seguridad detectados también estaban en el Dockerfile (patrón
glob en `COPY`, `npm install` sin versiones fijas, falta de
`--ignore-scripts`), lo que confirma que en un proyecto pequeño como este el
Dockerfile termina siendo tan relevante para la seguridad como el propio
código de la API. En general, el flujo DevSecOps deja claro que la IA acelera
la primera versión del código y de la infraestructura, pero la calidad y la
seguridad reales solo se confirman ejecutando las herramientas y entendiendo
cada hallazgo antes de corregirlo, no aceptando sugerencias a ciegas ni
descartando un CVE solo porque suena grave.
