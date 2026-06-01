export type TipoOperacao = "COMPRA" | "VENDA" | "NAO_IDENTIFICADO";

export interface ClienteInterno {
  id: number;
  nome: string;
  cnpj: string;
}

export interface NfeParsed {
  chave: string;
  emitente: { nome: string; cnpj: string };
  destinatario: { nome: string; cnpj: string };
  valorTotal: number;
  dataEmissao: string;
}

export interface NfeProcessada extends NfeParsed {
  operacao: TipoOperacao;
  clienteId: number | null;
  clienteNome: string | null;
  motivoNaoIdentificado: string | null;
}
