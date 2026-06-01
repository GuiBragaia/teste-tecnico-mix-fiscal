import { createApp } from "./app";
import { env } from "./config/env";
import { getDb } from "./db/database";
import { iniciarWorkerFila } from "./services/queue.service";

getDb();

const app = createApp();

app.listen(env.port, async () => {
  await iniciarWorkerFila();
  console.log(`API NF-e rodando em http://localhost:${env.port}`);
  console.log(`Swagger: http://localhost:${env.port}/docs`);
});
