Instalación y Configuración — TurnoSmart

**Autor:** Leonel Martín  
**Versión:** 1.0  
**Año:** 2025

---

##  Requisitos Previos

- Node.js ≥ 18
- npm ≥ 9
- MySQL ≥ 8

---

##  Instalación

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


Ejecución
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

Verificación
El servidor mostrará “Conexión exitosa a la base de datos”.

En el navegador se debe cargar la interfaz de TurnoSmart.

yaml
Copiar código

---
```
