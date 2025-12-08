import React, { useState, useEffect } from "react";
function App() {
  const [turnos, setTurnos] = useState([]);

  const fetchTurnos = async () => {
    try {
      const response = await fetch("https://api-node-turnos.onrender.com/api/proveedores");
      if (!response.ok) {
        throw new Error("Error al obtener los datos del servidor!!");
      }
      const data = await response.json();
      setTurnos(data);
    } catch (error) {
      console.log("Error al obtener los turnos!!", error);
    }
  };

  useEffect(() => {
    fetchTurnos();
  }, []);

  return (
    <div>
      <h1>Turnos</h1>
      <ul>
        {turnos.map((turno, id) => (
          <li key={id}>
            {turno.nombre} - {turno.turnos} - {turno.direccion} -{" "}
            {turno.telefono}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
