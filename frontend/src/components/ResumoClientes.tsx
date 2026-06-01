import { ResumoCliente } from "../api";

interface Props {
  dados: ResumoCliente[];
  carregando: boolean;
}

export function ResumoClientes({ dados, carregando }: Props) {
  return (
    <section className="card">
      <h2>Resumo por cliente</h2>

      {carregando && <p className="hint">Carregando...</p>}

      {!carregando && dados.length === 0 && (
        <p className="hint">Nenhum XML processado com cliente interno ainda.</p>
      )}

      {!carregando && dados.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Compra</th>
                <th>Venda</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((row) => (
                <tr key={row.cliente}>
                  <td>{row.cliente}</td>
                  <td>{row.compra}</td>
                  <td>{row.venda}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
