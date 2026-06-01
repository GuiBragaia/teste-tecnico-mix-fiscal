import { XmlSemVinculo } from "../api";

interface Props {
  dados: XmlSemVinculo[];
  carregando: boolean;
}

function formatarCnpj(cnpj: string) {
  if (cnpj.length !== 14) return cnpj;
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

export function SemVinculoList({ dados, carregando }: Props) {
  return (
    <section className="card">
      <h2>XMLs sem vínculo</h2>
      <p className="hint">
        Notas enviadas para fila de processamento posterior.
      </p>

      {carregando && <p className="hint">Carregando...</p>}

      {!carregando && dados.length === 0 && (
        <p className="hint">Nenhuma nota sem vínculo no momento.</p>
      )}

      {!carregando && dados.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Emitente</th>
                <th>CNPJ emitente</th>
                <th>Destinatário</th>
                <th>CNPJ destinatário</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item) => (
                <tr key={item.chave}>
                  <td>{item.emitente}</td>
                  <td>{formatarCnpj(item.emitenteCnpj)}</td>
                  <td>{item.destinatario}</td>
                  <td>{formatarCnpj(item.destinatarioCnpj)}</td>
                  <td>{item.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
