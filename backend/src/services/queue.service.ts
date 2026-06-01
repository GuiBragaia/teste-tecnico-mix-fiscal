import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "../config/env";
import { getDb } from "../db/database";

const QUEUE_NAME = "nfe-sem-vinculo";

let queue: Queue | null = null;
let redisOk: boolean | null = null;

async function redisDisponivel(): Promise<boolean> {
  if (redisOk !== null) return redisOk;

  const client = new IORedis(env.redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    lazyConnect: true,
  });

  try {
    await client.connect();
    await client.ping();
    redisOk = true;
  } catch {
    redisOk = false;
    console.warn("[fila] Redis indisponível — usando SQLite como fila");
  } finally {
    client.disconnect();
  }

  return redisOk;
}

function criarConexao() {
  return new IORedis(env.redisUrl, { maxRetriesPerRequest: null });
}

function gravarNaFilaLocal(payload: {
  chave: string;
  cnpj: string;
  nomeParte: string;
  motivo: string;
  xml: string;
}) {
  const db = getDb();
  db.prepare(
    `INSERT INTO fila_processamento (chave, cnpj, nome_parte, motivo, xml_original, status)
     VALUES (@chave, @cnpj, @nomeParte, @motivo, @xml, 'pendente')`,
  ).run({
    chave: payload.chave,
    cnpj: payload.cnpj,
    nomeParte: payload.nomeParte,
    motivo: payload.motivo,
    xml: payload.xml,
  });
}

export async function enfileirarNfeSemVinculo(payload: {
  chave: string;
  cnpj: string;
  nomeParte: string;
  motivo: string;
  xml: string;
}) {
  if (!(await redisDisponivel())) {
    gravarNaFilaLocal(payload);
    return;
  }

  if (!queue) {
    queue = new Queue(QUEUE_NAME, { connection: criarConexao() });
  }

  try {
    await queue.add("processar", payload, {
      removeOnComplete: 100,
      removeOnFail: 50,
    });
  } catch {
    gravarNaFilaLocal(payload);
  }
}

export async function iniciarWorkerFila() {
  if (!(await redisDisponivel())) return;

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { chave, cnpj, nomeParte, motivo, xml } = job.data;
      gravarNaFilaLocal({ chave, cnpj, nomeParte, motivo, xml });
      console.log(`[fila] NF-e ${chave} na fila de processamento`);
    },
    { connection: criarConexao() },
  );

  worker.on("failed", (job, err) => {
    console.error(`[fila] erro no job ${job?.id}:`, err.message);
  });

  console.log("[fila] worker BullMQ ativo");
}
