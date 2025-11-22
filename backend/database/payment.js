import mercadopago from "mercadopago";

export const createOrder = async (req, res) => {
  try {
    const { prod } = req.body;

    if (!prod || !prod.titulo || !prod.valorsena) {
      return res.status(400).json({ success: false, message: "Faltan datos" });
    }

    // Configurar MercadoPago
    mercadopago.configurations.setAccessToken(process.env.MP_ACCESS_TOKEN);

    const preference = {
      items: [
        {
          title: prod.titulo,
          unit_price: parseFloat(prod.valorsena),
          currency_id: "ARS",
          quantity: prod.cantidad,
        },
      ],
      back_urls: {
        success: "http://localhost:5173",
        failure: "http://localhost:5173/failure",
        pending: "http://localhost:5173/pending",
      },
      auto_return: "approved",
      binary_mode: true,
    };

    const response = await mercadopago.preferences.create(preference);

    console.log("MercadoPago response:", response);

    res.json({
      success: true,
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creando la orden:", error);
    res.status(500).json({ success: false, message: "Error creando la orden" });
  }
};
