const baseUrl = import.meta.env.VITE_API_URL || "/api";

export interface ResultadoUpload {
  arquivo: string;
  sucesso: boolean;
  chave?: string;
  operacao?: string;
  erro?: string;
}

export interface ResumoCliente {
  cliente: string;
  compra: number;
  venda: number;
}

export interface XmlSemVinculo {
  chave: string;
  emitente: string;
  emitenteCnpj: string;
  destinatario: string;
  destinatarioCnpj: string;
  motivo: string;
  criadoEm: string;
}

export async function uploadXmls(files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));

  const res = await fetch(`${baseUrl}/xml/upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.erro || "Falha no upload");
  }

  return data as {
    mensagem: string;
    resultados: ResultadoUpload[];
  };
}

export async function buscarResumoClientes() {
  const res = await fetch(`${baseUrl}/resumo/clientes`);
  if (!res.ok) throw new Error("Não foi possível carregar o resumo");
  return (await res.json()) as ResumoCliente[];
}

export async function buscarSemVinculo() {
  const res = await fetch(`${baseUrl}/resumo/sem-vinculo`);
  if (!res.ok) throw new Error("Não foi possível carregar XMLs sem vínculo");
  return (await res.json()) as XmlSemVinculo[];
}
