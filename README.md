##TurnoSmart

Autor: Leonel Martín
Versión: 1.0
Materia: Metodología de Sistemas I
Tecnicatura Universitaria en Programación — 2025


## Propósito / Alcance del Sistema

TurnoSmart es una aplicación web desarrollada con React + Node.js + MySQL que permite gestionar turnos entre proveedores (quienes publican sus horarios disponibles) y usuarios clientes (quienes reservan turnos).
El propósito principal es ofrecer una herramienta ágil y centralizada para la administración de turnos online, reduciendo tiempos y errores de coordinación.

## Cómo ejecutar localmente
npm run server   # Inicia el backend (Express + MySQL)
npm run dev      # Inicia el frontend (React con Vite)


Ver detalles de configuración en docs/INSTALL.md

## Dependencias y Variables de Entorno

Principales dependencias:

React 18

Node.js + Express

MySQL / mysql2

Axios

CORS

dotenv

Bootstrap 5

Archivo .env ejemplo:

PORT=3333
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=turnos
JWT_SECRET=mi_clave_secreta

## Estado del Pipeline

Ver definición en .github/workflows/deploy.yml

. Enlaces a Documentación

. SRS — TurnoSmart

. API Documentation

. Instalación y Configuración

. Aprendizajes y Conclusiones

Durante el desarrollo de TurnoSmart se implementó una solución full stack integrando React, Node.js y MySQL.
Se logró el registro y autenticación básica de usuarios, publicación y reserva de turnos, y la sincronización de datos entre proveedores y clientes.

Logros:

Conexión completa entre frontend y backend.

Implementación de rutas protegidas.

Gestión dinámica de turnos.

Pendiente/Futuro:

Incorporar autenticación con JWT.

Panel de administración.

Notificaciones automáticas por correo.

## Estructura del Repositorio
TurnoSmart/
 ├── src/
 │   ├── Components/
 │   ├── routes/
 │   ├── auth/
 │   └── main.tsx
 ├── database/conexion.js
 ├── docs/
 │   ├── srs-TurnoSmart.md
 │   ├── INSTALL.md
 │   └── API_documentation.md
 ├── .github/workflows/deploy.yml
 ├── package.json
 └── README.md


