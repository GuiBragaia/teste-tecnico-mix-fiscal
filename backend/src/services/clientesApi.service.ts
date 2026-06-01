import { ClienteInterno } from "../types/nfe";
import { env } from "../config/env";

let cache: ClienteInterno[] | null = null;
let cacheEm: number = 0;
const TTL_MS = 60_000;

export async function buscarClientesInternos(): Promise<ClienteInterno[]> {
  const agora = Date.now();
  if (cache && agora - cacheEm < TTL_MS) {
    return cache;
  }

  const response = await fetch(env.clientesApiUrl);

  if (!response.ok) {
    throw new Error(
      `Falha ao consultar API de clientes: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as ClienteInterno[];
  cache = data.map((c) => ({
    ...c,
    cnpj: c.cnpj.replace(/\D/g, ""),
  }));
  cacheEm = agora;

  return cache;
}

export function limparCacheClientes() {
  cache = null;
  cacheEm = 0;
}
