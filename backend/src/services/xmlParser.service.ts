import { XMLParser } from "fast-xml-parser";
import { NfeParsed } from "../types/nfe";

const parser = new XMLParser({
  ignoreAttributes: true,
  trimValues: true,
  parseTagValue: false,
});

export function parseNfeXml(xmlContent: string): NfeParsed {
  const parsed = parser.parse(xmlContent);

  if (!parsed?.nfe) {
    throw new Error("XML inválido: estrutura de NF-e não encontrada");
  }

  const nfe = parsed.nfe;

  const chave = String(nfe.chave ?? "").trim();
  if (!chave) {
    throw new Error("XML inválido: chave da NF-e ausente");
  }

  const emitente = nfe.emitente;
  const destinatario = nfe.destinatario;

  if (!emitente?.cnpj || !destinatario?.cnpj) {
    throw new Error("XML inválido: emitente ou destinatário incompleto");
  }

  const valorTotal = Number(nfe.valorTotal);
  if (Number.isNaN(valorTotal)) {
    throw new Error("XML inválido: valor total inválido");
  }

  return {
    chave,
    emitente: {
      nome: String(emitente.nome ?? "").trim(),
      cnpj: normalizarCnpj(String(emitente.cnpj)),
    },
    destinatario: {
      nome: String(destinatario.nome ?? "").trim(),
      cnpj: normalizarCnpj(String(destinatario.cnpj)),
    },
    valorTotal,
    dataEmissao: String(nfe.dataEmissao ?? "").trim(),
  };
}

function normalizarCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function isXmlContent(buffer: Buffer): boolean {
  const inicio = buffer.slice(0, 200).toString("utf-8").trim();
  return inicio.startsWith("<");
}
