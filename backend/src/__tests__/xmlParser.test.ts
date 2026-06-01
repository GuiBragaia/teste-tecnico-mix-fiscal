import { describe, expect, it } from "vitest";
import { parseNfeXml } from "../services/xmlParser.service";

const xmlValido = `<nfe>
  <chave>35260500000000000100010000000001123456789001</chave>
  <emitente>
    <nome>Loja</nome>
    <cnpj>77777777000107</cnpj>
  </emitente>
  <destinatario>
    <nome>Empresa ABC</nome>
    <cnpj>12345678000199</cnpj>
  </destinatario>
  <valorTotal>100.50</valorTotal>
  <dataEmissao>2026-05-02</dataEmissao>
</nfe>`;

describe("parseNfeXml", () => {
  it("extrai campos principais do XML", () => {
    const nfe = parseNfeXml(xmlValido);
    expect(nfe.chave).toContain("352605");
    expect(nfe.destinatario.cnpj).toBe("12345678000199");
    expect(nfe.valorTotal).toBe(100.5);
  });

  it("rejeita XML sem estrutura nfe", () => {
    expect(() => parseNfeXml("<root></root>")).toThrow();
  });
});
