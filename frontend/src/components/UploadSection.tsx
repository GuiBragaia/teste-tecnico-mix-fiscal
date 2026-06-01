import { useState } from "react";
import { uploadXmls, ResultadoUpload } from "../api";

interface Props {
  onUploadConcluido: () => void;
}

export function UploadSection({ onUploadConcluido }: Props) {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [resultados, setResultados] = useState<ResultadoUpload[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  function handleSelecao(e: React.ChangeEvent<HTMLInputElement>) {
    const lista = Array.from(e.target.files ?? []);
    const xmls = lista.filter((f) => f.name.toLowerCase().endsWith(".xml"));
    setArquivos(xmls);
    setMensagem(null);
    setErro(null);
    setResultados([]);
  }

  async function handleEnviar() {
    if (!arquivos.length) {
      setErro("Selecione ao menos um arquivo .xml");
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const resposta = await uploadXmls(arquivos);
      setMensagem(resposta.mensagem);
      setResultados(resposta.resultados);
      setArquivos([]);
      onUploadConcluido();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar arquivos");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="card">
      <h2>Upload de XML</h2>
      <p className="hint">
        Selecione um ou mais arquivos de NF-e para processamento.
      </p>

      <div className="upload-row">
        <input
          type="file"
          accept=".xml,text/xml,application/xml"
          multiple
          onChange={handleSelecao}
          disabled={enviando}
        />
        <button
          type="button"
          onClick={handleEnviar}
          disabled={enviando || !arquivos.length}
        >
          {enviando ? "Enviando..." : "Enviar"}
        </button>
      </div>

      {arquivos.length > 0 && (
        <p className="hint">{arquivos.length} arquivo(s) selecionado(s)</p>
      )}

      {erro && <div className="alert erro">{erro}</div>}
      {mensagem && <div className="alert ok">{mensagem}</div>}

      {resultados.length > 0 && (
        <ul className="resultado-lista">
          {resultados.map((r) => (
            <li key={r.arquivo} className={r.sucesso ? "ok" : "erro"}>
              <strong>{r.arquivo}</strong>
              {r.sucesso ? (
                <span> — {r.operacao}</span>
              ) : (
                <span> — {r.erro}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
