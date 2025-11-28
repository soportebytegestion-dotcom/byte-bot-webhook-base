import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

console.log("🔐 OPENAI_API_KEY existe?", !!process.env.OPENAI_API_KEY);
if (process.env.OPENAI_API_KEY) {
  console.log("API KEY cargada: SI");
} else {
  console.log("API KEY cargada: NO ❌");
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ===========================
// 🔥 RUTA WEBHOOK FRESHCHAT
// ===========================
app.post("/webhook", async (req, res) => {
  const mensajeUsuario = req.body.mensaje;

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
          { role: "system", content: "Sos Jarvis, el asistente virtual de Byte Gestión. Respondé siempre de manera clara y profesional." },
          { role: "user", content: mensajeUsuario }
        ],
        max_tokens: 300
      })
    });

    const data = await openaiResponse.json();

    console.log("🔵 Respuesta RAW de OpenAI:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("❌ ERROR DE OPENAI:", data.error);
    }

    const respuesta = data.choices?.[0]?.message?.content;

    if (!respuesta) {
      console.warn("⚠ No se generó respuesta, devolviendo fallback…");
      return res.json({
        fulfillment: {
          messages: [
            {
              type: "text",
              text: "Lo siento, no pude generar una respuesta."
            }
          ]
        }
      });
    }

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
            text: "Lo siento, hubo un problema procesando tu consulta."
          }
        ]
      }
    });
  }
});

// ===========================
// 🚀 START SERVER
// ===========================
app.listen(3000, () => {
  console.log("🚀 Servidor escuchando en puerto 3000");
});
