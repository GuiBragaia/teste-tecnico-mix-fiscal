import { classificarOperacao } from "./operacaoClassifier.service";
import { buscarClientesInternos } from "./clientesApi.service";
import { parseNfeXml } from "./xmlParser.service";
import { enfileirarNfeSemVinculo } from "./queue.service";
import { chaveJaExiste, salvarNfe } from "../repositories/nfe.repository";
import { NfeProcessada } from "../types/nfe";

export interface ResultadoUpload {
  arquivo: string;
  sucesso: boolean;
  chave?: string;
  operacao?: string;
  erro?: string;
}

export async function processarXml(
  nomeArquivo: string,
  conteudo: Buffer,
): Promise<ResultadoUpload> {
  try {
    const xml = conteudo.toString("utf-8");
    const nfeParsed = parseNfeXml(xml);

    if (chaveJaExiste(nfeParsed.chave)) {
      return {
        arquivo: nomeArquivo,
        sucesso: false,
        chave: nfeParsed.chave,
        erro: "NF-e já processada anteriormente",
      };
    }

    const clientes = await buscarClientesInternos();
    const nfe = classificarOperacao(nfeParsed, clientes);

    salvarNfe(nfe, xml);

    if (nfe.operacao === "NAO_IDENTIFICADO") {
      await enviarParaFila(nfe, xml);
    }

    return {
      arquivo: nomeArquivo,
      sucesso: true,
      chave: nfe.chave,
      operacao: nfe.operacao,
    };
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return { arquivo: nomeArquivo, sucesso: false, erro: mensagem };
  }
}

async function enviarParaFila(nfe: NfeProcessada, xml: string) {
  const cnpjReferencia = nfe.emitente.cnpj;
  const nomeReferencia = `${nfe.emitente.nome} / ${nfe.destinatario.nome}`;

  await enfileirarNfeSemVinculo({
    chave: nfe.chave,
    cnpj: cnpjReferencia,
    nomeParte: nomeReferencia,
    motivo: nfe.motivoNaoIdentificado ?? "Sem vínculo",
    xml,
  });
}
