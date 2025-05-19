import { useEffect, useState } from "react";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function AdminColaboradoresPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [registrosDoDia, setRegistrosDoDia] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    buscarUsuarios();
  }, []);

  async function buscarUsuarios() {
    const res = await fetch("http://localhost:3001/usuarios");
    const dados = await res.json();
    setUsuarios(dados);
  }

  async function iniciarEdicao(usuario) {
    setUsuarioEditando({ ...usuario });
    setMensagem('');
    buscarRegistros(usuario.email, dataSelecionada);
  }

  async function buscarRegistros(email, data) {
    try {
      const res = await fetch(`http://localhost:3001/registros/${email}`);
      const dados = await res.json();
      const filtrados = dados.filter(r => r.data === data);
      setRegistrosDoDia(filtrados);
    } catch (err) {
      console.error("Erro ao buscar registros:", err);
      setRegistrosDoDia([]);
    }
  }

  function cancelarEdicao() {
    setUsuarioEditando(null);
  }

  async function salvarEdicao() {
    const res = await fetch(`http://localhost:3001/usuarios/${usuarioEditando.email}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuarioEditando),
    });

    const dados = await res.json();
    setMensagem(dados.mensagem);
    setUsuarioEditando(null);
    buscarUsuarios();
  }

  async function deletarUsuario(email) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    await fetch(`http://localhost:3001/usuarios/${email}`, { method: "DELETE" });
    buscarUsuarios();
  }

  function compararHorarios(previsto, registrado) {
    if (!previsto || !registrado) return "";
    const h1 = dayjs(`2000-01-01T${previsto}`);
    const h2 = dayjs(`2000-01-01T${registrado}`);
    const diff = h2.diff(h1, 'minute');
    if (diff >= 5) return "text-red-600 font-semibold";
    if (Math.abs(diff) <= 3) return "text-green-600 font-semibold";
    return "";
  }

  function exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Relatório de Horários - ${usuarioEditando.nome}`, 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Evento", "Horário Previsto", "Horário Registrado"]],
      body: [
        ["Entrada", usuarioEditando.horaEntrada || "-", registrosDoDia.find(r => r.tipo === "entrada")?.hora || "-"],
        ["Intervalo / Saída", usuarioEditando.horaIntervaloSaida || "-", registrosDoDia.find(r => r.tipo === "intervalo-saida")?.hora || "-"],
        ["Intervalo / Retorno", usuarioEditando.horaIntervaloRetorno || "-", registrosDoDia.find(r => r.tipo === "intervalo-retorno")?.hora || "-"],
        ["Saída", usuarioEditando.horaSaida || "-", registrosDoDia.find(r => r.tipo === "saida")?.hora || "-"],
      ],
    });
    doc.save(`Ponto-${usuarioEditando.nome}.pdf`);
  }

  function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet([
      { Evento: "Entrada", Previsto: usuarioEditando.horaEntrada || "-", Registrado: registrosDoDia.find(r => r.tipo === "entrada")?.hora || "-" },
      { Evento: "Intervalo / Saída", Previsto: usuarioEditando.horaIntervaloSaida || "-", Registrado: registrosDoDia.find(r => r.tipo === "intervalo-saida")?.hora || "-" },
      { Evento: "Intervalo / Retorno", Previsto: usuarioEditando.horaIntervaloRetorno || "-", Registrado: registrosDoDia.find(r => r.tipo === "intervalo-retorno")?.hora || "-" },
      { Evento: "Saída", Previsto: usuarioEditando.horaSaida || "-", Registrado: registrosDoDia.find(r => r.tipo === "saida")?.hora || "-" },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, `Ponto-${usuarioEditando.nome}.xlsx`);
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestão de Colaboradores</h2>

      <table className="w-full border text-sm mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Nome</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Função</th>
            <th className="border px-2 py-1">Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.email}>
              <td className="border px-2 py-1">{u.nome}</td>
              <td className="border px-2 py-1">{u.email}</td>
              <td className="border px-2 py-1">{u.funcao || '-'}</td>
              <td className="border px-2 py-1 flex flex-col sm:flex-row gap-2 justify-center items-center">
                <button
                  onClick={() => iniciarEdicao(u)}
                  className="px-2 py-1 text-white bg-blue-600 rounded text-xs hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => deletarUsuario(u.email)}
                  className="px-2 py-1 text-white bg-red-600 rounded text-xs hover:bg-red-700"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {usuarioEditando && (
        <div className="bg-white border rounded p-4 shadow mt-6">
          <h3 className="text-lg font-semibold mb-4">Editar: {usuarioEditando.nome}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
              <input
                type="text"
                value={usuarioEditando.funcao || ''}
                onChange={(e) => setUsuarioEditando({ ...usuarioEditando, funcao: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Entrada</label>
              <input
                type="time"
                value={usuarioEditando.horaEntrada || ''}
                onChange={(e) => setUsuarioEditando({ ...usuarioEditando, horaEntrada: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início do Intervalo</label>
              <input
                type="time"
                value={usuarioEditando.horaIntervaloSaida || ''}
                onChange={(e) => setUsuarioEditando({ ...usuarioEditando, horaIntervaloSaida: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retorno do Intervalo</label>
              <input
                type="time"
                value={usuarioEditando.horaIntervaloRetorno || ''}
                onChange={(e) => setUsuarioEditando({ ...usuarioEditando, horaIntervaloRetorno: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Saída</label>
              <input
                type="time"
                value={usuarioEditando.horaSaida || ''}
                onChange={(e) => setUsuarioEditando({ ...usuarioEditando, horaSaida: e.target.value })}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Data</label>
              <input
                type="date"
                value={dataSelecionada}
                onChange={(e) => {
                  setDataSelecionada(e.target.value);
                  buscarRegistros(usuarioEditando.email, e.target.value);
                }}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>

          {registrosDoDia.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Comparativo de Horários ({dataSelecionada.split('-').reverse().join('/')})</h4>
              <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-2 py-1">Evento</th>
                    <th className="border px-2 py-1">Horário Previsto</th>
                    <th className="border px-2 py-1">Horário Registrado</th>
                  </tr>
                </thead>
                <tbody>
                  {[ 
                    { tipo: "entrada", label: "Entrada", previsto: usuarioEditando.horaEntrada },
                    { tipo: "intervalo-saida", label: "Intervalo / Saída", previsto: usuarioEditando.horaIntervaloSaida },
                    { tipo: "intervalo-retorno", label: "Intervalo / Retorno", previsto: usuarioEditando.horaIntervaloRetorno },
                    { tipo: "saida", label: "Saída", previsto: usuarioEditando.horaSaida }
                  ].map((item) => {
                    const registro = registrosDoDia.find(r => r.tipo === item.tipo);
                    const registrado = registro?.hora || "-";
                    const estilo = compararHorarios(item.previsto, registrado);
                    return (
                      <tr key={item.tipo}>
                        <td className="border px-2 py-1">{item.label}</td>
                        <td className="border px-2 py-1">{item.previsto || "-"}</td>
                        <td className={`border px-2 py-1 ${estilo}`}>{registrado}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="mt-4 flex gap-3">
                <button onClick={exportarPDF} className="px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                  Exportar PDF
                </button>
                <button onClick={exportarExcel} className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  Exportar Excel
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={salvarEdicao}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Salvar
            </button>
            <button
              onClick={cancelarEdicao}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
          </div>

          {mensagem && <p className="mt-3 text-sm text-green-600">{mensagem}</p>}
        </div>
      )}
    </div>
  );
}