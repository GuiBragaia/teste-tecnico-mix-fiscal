import { useCallback, useEffect, useState } from "react";
import {
  buscarResumoClientes,
  buscarSemVinculo,
  ResumoCliente,
  XmlSemVinculo,
} from "./api";
import { UploadSection } from "./components/UploadSection";
import { ResumoClientes } from "./components/ResumoClientes";
import { SemVinculoList } from "./components/SemVinculoList";

export default function App() {
  const [resumo, setResumo] = useState<ResumoCliente[]>([]);
  const [semVinculo, setSemVinculo] = useState<XmlSemVinculo[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [resumoData, semVinculoData] = await Promise.all([
        buscarResumoClientes(),
        buscarSemVinculo(),
      ]);
      setResumo(resumoData);
      setSemVinculo(semVinculoData);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregarDados();
  }, [recarregarDados]);

  return (
    <div className="page">
      <header>
        <h1>Processamento de NF-e</h1>
        <p>Upload, classificação e resumo por cliente interno</p>
      </header>

      <main>
        <UploadSection onUploadConcluido={recarregarDados} />
        <ResumoClientes dados={resumo} carregando={carregando} />
        <SemVinculoList dados={semVinculo} carregando={carregando} />
      </main>
    </div>
  );
}
