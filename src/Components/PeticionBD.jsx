import { useState, useEffect } from "react";

function usePeticionBD(tabla: string) {
  const [datos, setDatos] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        setError(null);
        const response = await fetch(`http://localhost:3333/api/${tabla}`);
        if (!response.ok) {
          throw new Error(
            `Error al obtener los ${tabla}: ${response.statusText}`
          );
        }
        const data = await response.json();
        setDatos(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchDatos();
  }, [tabla]);

  return { datos, error };
}

export default usePeticionBD;
