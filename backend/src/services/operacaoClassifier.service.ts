import { ClienteInterno, NfeParsed, NfeProcessada } from "../types/nfe";

export function classificarOperacao(
  nfe: NfeParsed,
  clientes: ClienteInterno[],
): NfeProcessada {
  const clienteDest = clientes.find((c) => c.cnpj === nfe.destinatario.cnpj);
  const clienteEmit = clientes.find((c) => c.cnpj === nfe.emitente.cnpj);

  // Destinatário interno tem prioridade (entrada/compra)
  if (clienteDest) {
    return {
      ...nfe,
      operacao: "COMPRA",
      clienteId: clienteDest.id,
      clienteNome: clienteDest.nome,
      motivoNaoIdentificado: null,
    };
  }

  if (clienteEmit) {
    return {
      ...nfe,
      operacao: "VENDA",
      clienteId: clienteEmit.id,
      clienteNome: clienteEmit.nome,
      motivoNaoIdentificado: null,
    };
  }

  return {
    ...nfe,
    operacao: "NAO_IDENTIFICADO",
    clienteId: null,
    clienteNome: null,
    motivoNaoIdentificado:
      "Nenhum CNPJ de emitente ou destinatário corresponde a cliente interno",
  };
}
