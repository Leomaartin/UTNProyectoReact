#  SRS — TurnoSmart

**Versión:** 1.0  
**Autor:** Leonel Martín  
**Materia:** Gestión de Desarrollos de Software
**Año:** 2025

---

## 1. Introducción

**Propósito:**  
El sistema TurnoSmart tiene como objetivo facilitar la gestión de turnos entre proveedores y usuarios clientes. Permite que los proveedores publiquen turnos disponibles y que los usuarios los reserven de manera simple, rápida y centralizada.

**Alcance:**

- Gestión de usuarios (registro, login).
- Publicación de turnos (proveedor).
- Reserva y cancelación de turnos (usuario).
- Sincronización entre ambas partes.

---

## 2. Actores

Actor | Descripción
**Usuario Cliente** | Persona que busca reservar turnos disponibles.
**Proveedor** | Profesional o comercio que publica y administra turnos.
**Administrador (futuro)** | Encargado de la supervisión general del sistema.

---

## 3. Requisitos Funcionales

ID | Requisito | Criterio de Aceptación |
RF1 Registrar usuario/proveedor | El sistema guarda datos válidos en la BD.
RF2 Iniciar sesión | Permite acceso a vistas específicas según tipo de cuenta.
RF3 Publicar turnos | Proveedor puede registrar fechas y horarios.
RF4 Ver turnos disponibles | Usuario visualiza lista ordenada por fecha.
RF5 Reservar turno | Turno pasa a estado “ocupado”.
RF6 Cancelar turno | Se elimina el turno de ambas partes.

---

## 4. Requisitos No Funcionales

ID | Tipo | Descripción
RNF1 | Rendimiento | Respuesta de servidor < 2 segundos.
RNF2 | Seguridad | Uso de contraseñas encriptadas.
RNF3 | Compatibilidad | Compatible con navegadores modernos.
RNF4 | Usabilidad | Interfaz simple e intuitiva.

---

## 5. Supuestos y Restricciones

- Se asume conexión activa a internet.
- La base de datos debe estar corriendo localmente.
- Restricción: No permite múltiples reservas del mismo turno.

---

## 6. Trazabilidad

Requisito | Implementación
RF1, RF2 | `/api/register`, `/api/infoUsuarios`
RF3 | `/api/registrarTurnos`
RF4 | `/api/turnosDisponibles`
RF5 | `/api/turnoGuardado`, `/api/turnoAgendado`
RF6 | `/api/cancelarTurno`

---

## 7. Conclusión

TurnoSmart cumple los requisitos funcionales principales de un sistema de reservas online, siendo fácilmente escalable a un entorno productivo con autenticación JWT y panel administrativo.
