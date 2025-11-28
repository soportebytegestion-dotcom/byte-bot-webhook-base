import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Para debug (podés borrar después)
console.log("API KEY cargada:", process.env.OPENAI_API_KEY ? "SI" : "NO");

app.post("/webhook", async (req, res) => {
  const mensajeUsuario =
    req.body.mensaje ||
    req.body.message ||
    req.body.text ||
    JSON.stringify(req.body);

  console.log("🟢 Webhook recibido:", mensajeUsuario);

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Sos Jarvis, el asistente virtual de Byte Gestión. Respondé siempre de manera clara, profesional y directa."
          },
          {
            role: "user",
            content: mensajeUsuario
          }
        ],
        max_tokens: 300
      })
    });

    const data = await openaiResponse.json();

    // Mostrar errores de OpenAI
    if (!openaiResponse.ok) {
      console.error("🔥 Error OpenAI:", data);
      throw new Error("OpenAI no respondió bien");
    }

    const respuesta =
      data.choices?.[0]?.message?.content ||
      "Lo siento, no pude generar una respuesta.";

    console.log("🟣 Respuesta de ChatGPT:", respuesta);

    return res.json({
      fulfillment: {
        messages: [
          {
            type: "text",
            text: respuesta
          }
        ]
      }
    });

  } catch (error) {
    console.error("❌ Error general:", error);

    return res.json({
      fulfillment: {
        messages: [
          {
            type: "text",
            text: "Hubo un error procesando tu consulta."
          }
        ]
      }
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor escuchando en puerto 3000");
});
