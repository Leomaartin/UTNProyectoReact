## Instalación y Configuración — TurnoSmart

**Autor:** Leonel Martín  
**Versión:** 1.0  
**Año:** 2025

---

## Requisitos Previos

- Node.js ≥ 18
- npm ≥ 9
- MySQL ≥ 8

---

## Instalación

```bash
git clone https://github.com/usuario/TurnoSmart.git
cd TurnoSmart
npm install
Configuración del entorno
Crear archivo .env en la raíz con:

ini
Copiar código
PORT=3333
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=turnos
JWT_SECRET=mi_clave_secreta

## Ejecución
Backend:
bash
Copiar código
npm run server
Frontend:
bash
Copiar código
npm run dev
Abrir en el navegador:
http://localhost:5173

## Verificación
El servidor mostrará “Conexión exitosa a la base de datos”.

En el navegador se debe cargar la interfaz de TurnoSmart.

yaml
Copiar código

## Intentos de despliegue
Se intentó desplegar el proyecto TurnoSmart utilizando **Vercel** para el frontend (React) y **Render** para el backend (Node.js).
Durante el proceso se configuró correctamente el pipeline de CI/CD para que el proyecto se construya y pruebe automáticamente al hacer push en la rama principal.

Sin embargo, se presentaron dificultades al conectar la base de datos MySQL en el entorno de producción, ya que Render requiere configuración adicional para permitir conexiones externas.
Aunque el despliegue completo no se concretó, se logró comprender el flujo de trabajo de integración continua (build + tests) y se dejó la base lista para un despliegue futuro.

Como mejora futura, se planea usar **Railway** o **Docker Compose** para gestionar las dependencias del backend y la base de datos de forma más integrada.


```
