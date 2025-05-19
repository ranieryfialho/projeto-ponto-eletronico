import { useState } from "react";

export default function PontoButtonComTipo({ onPontoRegistrado, usuario, onLogout }) {
  const [status, setStatus] = useState(null);
  const [tipo, setTipo] = useState("entrada");

  const tiposDisponiveis = [
    { value: "entrada", label: "Entrada" },
    { value: "intervalo-saida", label: "Intervalo / Saída" },
    { value: "intervalo-retorno", label: "Intervalo / Retorno" },
    { value: "saida", label: "Saída" },
    { value: "extra-entrada", label: "Horas Extras Entrada" },
    { value: "extra-saida", label: "Horas Extras Saída" },
  ];

  function registrarPonto() {
    setStatus({ tipo: "info", mensagem: "Verificando localização..." });

    if (!navigator.geolocation) {
      setStatus({ tipo: "erro", mensagem: "Seu navegador não suporta geolocalização." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        const latEmpresa = -3.733723423876559;
        const lonEmpresa = -38.55711889992004;
        const distancia = calcularDistancia(latitude, longitude, latEmpresa, lonEmpresa);
        const emRedePermitida = true;

        if (distancia <= 2.5 && emRedePermitida) {
          const agora = new Date();
          const data = agora.toISOString().split("T")[0];
          const hora = agora.toLocaleTimeString();

          const novoRegistro = { 
            usuario,
            tipo, 
            data, 
            hora 
          };

          // Envia para o servidor
          fetch("http://localhost:3001/registros", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(novoRegistro),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Erro ao enviar registro para o servidor");
              return res.json();
            })
            .then((dados) => {
              // Atualiza local e estado apenas após sucesso
              const registros = JSON.parse(localStorage.getItem("registrosPontoDetalhado")) || [];
              registros.push(novoRegistro);
              localStorage.setItem("registrosPontoDetalhado", JSON.stringify(registros));

              if (onPontoRegistrado) {
                onPontoRegistrado(novoRegistro);
              }

              setStatus({
                tipo: "sucesso",
                mensagem: dados.mensagem || "Registro salvo e enviado!",
                hora,
              });
            })
            .catch((err) => {
              setStatus({
                tipo: "erro",
                mensagem: "❌ Erro ao enviar para o servidor.",
              });
              console.error(err);
            });
        } else {
          setStatus({ tipo: "erro", mensagem: "❌ Fora da geolocalização permitida." });
        }
      },
      () => {
        setStatus({ tipo: "erro", mensagem: "Erro ao obter localização." });
      }
    );
  }

  function tipoFormatado(tipo) {
    const tipoEncontrado = tiposDisponiveis.find((t) => t.value === tipo);
    return tipoEncontrado ? tipoEncontrado.label : tipo;
  }

  function calcularDistancia(lat1, lon1, lat2, lon2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  return (
    <div className="w-full max-w-6xl px-4 mx-auto flex flex-col gap-6">
      {/* Saudação + Botão sair */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between gap-2 w-full">
        <p className="text-base sm:text-lg font-medium text-center sm:text-left">
          Olá, {usuario}! 👋
        </p>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 text-sm"
        >
          Sair
        </button>
      </div>

      {/* Tipo de Registro + Botão Registrar */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full sm:w-auto">
        <label
          htmlFor="tipo"
          className="text-base sm:text-base font-medium text-gray-700 w-full text-center sm:text-left"
        >
          Tipo de Registro:
        </label>
        <select
          id="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="px-4 py-2 border rounded-md text-sm w-full sm:w-auto"
        >
          {tiposDisponiveis.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={registrarPonto}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 transition text-sm whitespace-nowrap"
        >
          Registrar Ponto
        </button>
      </div>

      {/* Mensagem de status */}
      {status?.mensagem && (
        <div
          className={`text-sm px-4 py-2 rounded shadow max-w-xl mx-auto ${
            status.tipo === "sucesso"
              ? "bg-green-100 text-green-700 border border-green-300"
              : status.tipo === "erro"
              ? "bg-red-100 text-red-700 border border-red-300"
              : "bg-blue-100 text-blue-700 border border-blue-300"
          }`}
        >
          <span className="font-semibold">{status.mensagem}</span>
          {status.hora && (
            <div className="text-xs text-gray-500 mt-1">Horário: {status.hora}</div>
          )}
        </div>
      )}
    </div>
  );
}