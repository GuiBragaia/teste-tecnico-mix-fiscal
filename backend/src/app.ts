import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { xmlRouter } from "./routes/xml.routes";
import { resumoRouter } from "./routes/resumo.routes";
import { openApiSpec } from "./swagger/openapi";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.get("/openapi.json", (_req, res) => {
    res.json(openApiSpec);
  });

  app.use("/xml", xmlRouter);
  app.use("/resumo", resumoRouter);

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      console.error("[erro]", err.message);
      res.status(400).json({ erro: err.message });
    },
  );

  return app;
}
