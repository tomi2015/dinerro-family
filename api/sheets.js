// Este archivo es el puente entre tu app y Google Sheets
// Vercel lo convierte en una función que corre en internet

const { google } = require("googleapis");

export default async function handler(req, res) {
  // Permitir que la app pueda llamar este archivo
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");

  try {
    // Conectarse a Google usando las credenciales secretas
    const credenciales = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    const auth = new google.auth.GoogleAuth({
      credentials: credenciales,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const SHEETS_ID = process.env.SHEETS_ID;

    // Si es GET — leer datos
    if (req.method === "GET") {
      const hoja = req.query.hoja || "EGRESOS";
      const respuesta = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEETS_ID,
        range: hoja,
      });
      return res.status(200).json({ datos: respuesta.data.values || [] });
    }

    // Si es POST — escribir datos nuevos
    if (req.method === "POST") {
      const { hoja, fila } = req.body;
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEETS_ID,
        range: hoja,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [fila] },
      });
      return res.status(200).json({ ok: true });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}