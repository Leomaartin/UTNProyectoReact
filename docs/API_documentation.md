## Documentación de la API — TurnoSmart

**Base URL:** `http://localhost:3333/api`  
**Formato:** JSON  
**Autenticación:** (Pendiente de implementación con JWT)

🔹 POST /api/register
Registra un nuevo usuario o proveedor.  
**Body:**

```json
{
  "nombre": "Juan Pérez",
  "gmail": "juan@gmail.com",
  "password": "1234",
  "tipoCuenta": 0
}
🔹 POST /api/infoUsuarios
Valida el inicio de sesión.
Body:

json
Copiar código
{
  "gmail": "juan@gmail.com",
  "password": "1234"
}




🔹 GET /api/turnosDisponibles
Devuelve todos los turnos disponibles publicados.

Respuesta:

json
Copiar código
[
  {
    "id": 1,
    "fecha": "2025-11-09",
    "hora_inicio": "09:00",
    "hora_fin": "09:30",
    "proveedor": "Spa Relax"
  }
]




🔹 POST /api/registrarTurnos
Inserta nuevos turnos disponibles.
Body:

json
Copiar código
{
  "turnosDispo": [
    {
      "fecha": "2025-11-10",
      "hora_inicio": "14:00",
      "hora_fin": "15:00",
      "id_proveedor": 2
    }
  ]
}




🔹 DELETE /api/borrarTurno/:id
Elimina un turno publicado.
Parámetro: id — ID del turno a borrar.




🔹 POST /api/turnoAgendado
Guarda la reserva de un turno en el perfil del proveedor.
Body:

json
Copiar código
{
  "proveedorid": 1,
  "turnos": [{ "id": "abc123", "fecha": "2025-11-09", "hora_inicio": "10:00" }]
}




🔹 POST /api/turnoGuardado
Guarda la reserva de un turno en el perfil del usuario.
Body:

json
Copiar código
{
  "usuarioid": 3,
  "turnos": [{ "id": "abc123", "fecha": "2025-11-09", "hora_inicio": "10:00" }]
}




🔹 DELETE /api/cancelarTurno
Cancela una reserva de turno para ambas partes.
Body:

json
Copiar código
{
  "proveedorid": 1,
  "usuarioid": 3,
  "id": "abc123"
}


Códigos de Error
Código	Motivo	Descripción
400	Datos inválidos	Faltan campos requeridos
404	No encontrado	Registro no existente
500	Error interno	Problema en el servidor MySQL

Próximas mejoras
-Mejorar estetica de la web.
-Terminar funcionalidades como cancelar turnos.
-Mejorar el perfil de usuarios y proveedores.
-Agregar logica para si un proveedoor quiere añladir seña a sus turnos.

```
