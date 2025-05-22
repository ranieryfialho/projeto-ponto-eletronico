import { useEffect, useState } from "react";
import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function AdminColaboradoresPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [registrosDoDia, setRegistrosDoDia] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(dayjs().format('YYYY-MM-DD'));
  const [filtro, setFiltro] = useState('');

  const API = "https://ponto-eletronico-8bcy.onrender.com";

  useEffect(() => {
    buscarUsuarios();
  }, []);

  async function buscarUsuarios() {
    const res = await fetch(`${API}/usuarios`);
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
      const res = await fetch(`${API}/registros/${email}`);
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
    const res = await fetch(`${API}/usuarios/${usuarioEditando.email}`, {
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
    await fetch(`${API}/usuarios/${email}`, { method: "DELETE" });
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

  async function exportarPDF() {
    const res = await fetch(`${API}/registros/${usuarioEditando.email}`);
    const todosRegistros = await res.json();

    const mesSelecionado = dayjs(dataSelecionada).month();
    const registrosMes = todosRegistros.filter(r => dayjs(r.data).month() === mesSelecionado);

    const eventosPorData = {};
    for (const r of registrosMes) {
      if (!eventosPorData[r.data]) eventosPorData[r.data] = {};
      eventosPorData[r.data][r.tipo] = r.hora;
    }

    const linhas = Object.entries(eventosPorData).flatMap(([data, eventos]) => ([
      [`Data: ${dayjs(data).format("DD/MM/YYYY")}`, "", "", ""],
      ["Entrada", usuarioEditando.horaEntrada || "-", eventos["entrada"] || "-"],
      ["Intervalo / Saída", usuarioEditando.horaIntervaloSaida || "-", eventos["intervalo-saida"] || "-"],
      ["Intervalo / Retorno", usuarioEditando.horaIntervaloRetorno || "-", eventos["intervalo-retorno"] || "-"],
      ["Saída", usuarioEditando.horaSaida || "-", eventos["saida"] || "-"],
      ["", "", "", ""]
    ]));

    const doc = new jsPDF();
    doc.text(`Relatório Mensal de Horários - ${usuarioEditando.nome}`, 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Evento", "Horário Previsto", "Horário Registrado"]],
      body: linhas,
      theme: 'striped'
    });
    doc.save(`Ponto-Mensal-${usuarioEditando.nome}.pdf`);
  }

  async function exportarExcel() {
    const res = await fetch(`${API}/registros/${usuarioEditando.email}`);
    const todosRegistros = await res.json();

    const mesSelecionado = dayjs(dataSelecionada).month();
    const registrosMes = todosRegistros.filter(r => dayjs(r.data).month() === mesSelecionado);

    const eventosPorData = {};
    for (const r of registrosMes) {
      if (!eventosPorData[r.data]) eventosPorData[r.data] = {};
      eventosPorData[r.data][r.tipo] = r.hora;
    }

    const dadosPlanilha = [];
    Object.entries(eventosPorData).forEach(([data, eventos]) => {
      dadosPlanilha.push({ Dia: dayjs(data).format("DD/MM/YYYY"), Evento: "", Previsto: "", Registrado: "" });

      dadosPlanilha.push({ Dia: "", Evento: "Entrada", Previsto: usuarioEditando.horaEntrada || "-", Registrado: eventos["entrada"] || "-" });
      dadosPlanilha.push({ Dia: "", Evento: "Intervalo / Saída", Previsto: usuarioEditando.horaIntervaloSaida || "-", Registrado: eventos["intervalo-saida"] || "-" });
      dadosPlanilha.push({ Dia: "", Evento: "Intervalo / Retorno", Previsto: usuarioEditando.horaIntervaloRetorno || "-", Registrado: eventos["intervalo-retorno"] || "-" });
      dadosPlanilha.push({ Dia: "", Evento: "Saída", Previsto: usuarioEditando.horaSaida || "-", Registrado: eventos["saida"] || "-" });

      dadosPlanilha.push({});
    });

    const ws = XLSX.utils.json_to_sheet(dadosPlanilha, { skipHeader: false });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros Mensais");
    XLSX.writeFile(wb, `Ponto-Mensal-${usuarioEditando.nome}.xlsx`);
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = filtro.toLowerCase();
    return (
      u.nome?.toLowerCase().includes(texto) ||
      u.funcao?.toLowerCase().includes(texto) ||
      u.email?.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestão de Colaboradores</h2>

      <input
        type="text"
        placeholder="Filtrar por nome, função ou email"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm mb-6">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-2 py-1">Nome</th>
              <th className="border px-2 py-1">Email</th>
              <th className="border px-2 py-1">Função</th>
              <th className="border px-2 py-1">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u) => (
              <tr key={u.email}>
                <td className="border px-2 py-1">{u.nome}</td>
                <td className="border px-2 py-1">{u.email}</td>
                <td className="border px-2 py-1">{u.funcao || '-'}</td>
                <td className="border px-2 py-1 flex justify-center gap-2">
                  <button
                    onClick={() => iniciarEdicao(u)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded"
                    title="Editar"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => deletarUsuario(u.email)}
                    className="bg-red-600 hover:bg-red-700 text-white p-1 rounded"
                    title="Excluir"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usuarioEditando && (
        <div className="bg-white border rounded p-4 shadow mt-6">
          <h3 className="text-lg font-semibold mb-4">Editar: {usuarioEditando.nome}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Função", tipo: "text", key: "funcao" },
              { label: "Horário de Entrada", tipo: "time", key: "horaEntrada" },
              { label: "Início do Intervalo", tipo: "time", key: "horaIntervaloSaida" },
              { label: "Retorno do Intervalo", tipo: "time", key: "horaIntervaloRetorno" },
              { label: "Horário de Saída", tipo: "time", key: "horaSaida" }
            ].map(({ label, tipo, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type={tipo}
                  value={usuarioEditando[key] || ''}
                  onChange={(e) => setUsuarioEditando({ ...usuarioEditando, [key]: e.target.value })}
                  className="border p-2 rounded w-full"
                />
              </div>
            ))}

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
              <h4 className="text-sm font-semibold mb-2">
                Comparativo de Horários ({dataSelecionada.split('-').reverse().join('/')})
              </h4>
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
                  ].map(({ tipo, label, previsto }) => {
                    const registro = registrosDoDia.find(r => r.tipo === tipo);
                    const registrado = registro?.hora || "-";
                    const estilo = compararHorarios(previsto, registrado);
                    return (
                      <tr key={tipo}>
                        <td className="border px-2 py-1">{label}</td>
                        <td className="border px-2 py-1">{previsto || "-"}</td>
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