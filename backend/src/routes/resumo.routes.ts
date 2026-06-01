import { Router } from "express";
import {
  listarXmlsSemVinculo,
  obterResumoPorCliente,
} from "../repositories/nfe.repository";

export const resumoRouter = Router();

resumoRouter.get("/clientes", (_req, res) => {
  const resumo = obterResumoPorCliente();
  res.json(resumo);
});

resumoRouter.get("/sem-vinculo", (_req, res) => {
  const lista = listarXmlsSemVinculo();
  res.json(lista);
});
