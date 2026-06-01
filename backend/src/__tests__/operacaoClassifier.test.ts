import { describe, expect, it } from "vitest";
import { classificarOperacao } from "../services/operacaoClassifier.service";
import { NfeParsed } from "../types/nfe";

const clientes = [
  { id: 1, nome: "Empresa ABC", cnpj: "12345678000199" },
  { id: 2, nome: "Empresa XPTO", cnpj: "99887766000155" },
];

const baseNfe: NfeParsed = {
  chave: "123",
  emitente: { nome: "Fornecedor", cnpj: "11111111000101" },
  destinatario: { nome: "Cliente", cnpj: "12345678000199" },
  valorTotal: 100,
  dataEmissao: "2026-05-01",
};

describe("classificarOperacao", () => {
  it("identifica compra quando destinatário é interno", () => {
    const result = classificarOperacao(baseNfe, clientes);
    expect(result.operacao).toBe("COMPRA");
    expect(result.clienteNome).toBe("Empresa ABC");
  });

  it("identifica venda quando emitente é interno", () => {
    const nfe: NfeParsed = {
      ...baseNfe,
      emitente: { nome: "Empresa XPTO", cnpj: "99887766000155" },
      destinatario: { nome: "Terceiro", cnpj: "99999999000199" },
    };
    const result = classificarOperacao(nfe, clientes);
    expect(result.operacao).toBe("VENDA");
    expect(result.clienteNome).toBe("Empresa XPTO");
  });

  it("marca como não identificado sem clientes internos", () => {
    const nfe: NfeParsed = {
      ...baseNfe,
      destinatario: { nome: "Terceiro", cnpj: "99999999000199" },
    };
    const result = classificarOperacao(nfe, clientes);
    expect(result.operacao).toBe("NAO_IDENTIFICADO");
    expect(result.motivoNaoIdentificado).toBeTruthy();
  });
});
