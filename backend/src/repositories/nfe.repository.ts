import { getDb } from "../db/database";
import { NfeProcessada } from "../types/nfe";

export function salvarNfe(nfe: NfeProcessada, xmlOriginal: string) {
  const db = getDb();

  db.prepare(
    `INSERT INTO nfe_documentos (
      chave, emitente_nome, emitente_cnpj, destinatario_nome, destinatario_cnpj,
      valor_total, data_emissao, operacao, cliente_id, cliente_nome,
      motivo_nao_identificado, xml_original
    ) VALUES (
      @chave, @emitenteNome, @emitenteCnpj, @destinatarioNome, @destinatarioCnpj,
      @valorTotal, @dataEmissao, @operacao, @clienteId, @clienteNome,
      @motivo, @xmlOriginal
    )`,
  ).run({
    chave: nfe.chave,
    emitenteNome: nfe.emitente.nome,
    emitenteCnpj: nfe.emitente.cnpj,
    destinatarioNome: nfe.destinatario.nome,
    destinatarioCnpj: nfe.destinatario.cnpj,
    valorTotal: nfe.valorTotal,
    dataEmissao: nfe.dataEmissao,
    operacao: nfe.operacao,
    clienteId: nfe.clienteId,
    clienteNome: nfe.clienteNome,
    motivo: nfe.motivoNaoIdentificado,
    xmlOriginal,
  });
}

export function chaveJaExiste(chave: string): boolean {
  const db = getDb();
  const row = db
    .prepare("SELECT 1 FROM nfe_documentos WHERE chave = ?")
    .get(chave);
  return !!row;
}

export interface ResumoCliente {
  cliente: string;
  compra: number;
  venda: number;
}

export function obterResumoPorCliente(): ResumoCliente[] {
  const db = getDb();

  const rows = db
    .prepare(
      `SELECT cliente_nome AS cliente,
              SUM(CASE WHEN operacao = 'COMPRA' THEN 1 ELSE 0 END) AS compra,
              SUM(CASE WHEN operacao = 'VENDA' THEN 1 ELSE 0 END) AS venda
       FROM nfe_documentos
       WHERE cliente_nome IS NOT NULL
       GROUP BY cliente_nome
       ORDER BY cliente_nome`,
    )
    .all() as ResumoCliente[];

  return rows;
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

export function listarXmlsSemVinculo(): XmlSemVinculo[] {
  const db = getDb();

  return db
    .prepare(
      `SELECT chave,
              emitente_nome AS emitente,
              emitente_cnpj AS emitenteCnpj,
              destinatario_nome AS destinatario,
              destinatario_cnpj AS destinatarioCnpj,
              motivo_nao_identificado AS motivo,
              criado_em AS criadoEm
       FROM nfe_documentos
       WHERE operacao = 'NAO_IDENTIFICADO'
       ORDER BY criado_em DESC`,
    )
    .all() as XmlSemVinculo[];
}
