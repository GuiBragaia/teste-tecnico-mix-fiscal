import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3002;

const clientesPath =
  process.env.MOCK_CLIENTES_PATH ||
  path.resolve(__dirname, "../../xml_nfe_mock_v2_e_lista_clientes/clientes.json");

app.use(cors());

app.get("/clientes", (_req, res) => {
  try {
    const raw = fs.readFileSync(clientesPath, "utf-8");
    res.json(JSON.parse(raw));
  } catch {
    res.status(500).json({ erro: "Não foi possível carregar clientes.json" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Mock API de clientes rodando em http://localhost:${port}`);
});
