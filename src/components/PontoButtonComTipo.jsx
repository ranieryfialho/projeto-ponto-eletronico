import { useState } from "react";

export default function PontoButtonComTipo({ usuario, onLogout, onPontoRegistrado }) {
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

  async function verificarRedePermitida() {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      const ipAtual = data.ip;

      const ipsPermitidos = [
        "177.37.136.51"
      ];

      return ipsPermitidos.includes(ipAtual);
    } catch (error) {
      console.error("Erro ao verificar IP:", error);
      return false;
    }
  }

  async function registrarPonto() {
    setStatus({ tipo: "info", mensagem: "Verificando localização..." });

    if (!navigator.geolocation) {
      setStatus({ tipo: "erro", mensagem: "Seu navegador não suporta geolocalização." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        const latEmpresa = -3.7339052949664735;
        const lonEmpresa = -38.55712695731955;
        const distancia = calcularDistancia(latitude, longitude, latEmpresa, lonEmpresa);
        const emRedePermitida = await verificarRedePermitida();

        if (distancia <= 10 && emRedePermitida) {
          const agora = new Date();
          const data = agora.toLocaleDateString('pt-BR').split('/').reverse().join('-');
          const hora = agora.toLocaleTimeString();

          const novoRegistro = {
            usuario: usuario.email,
            tipo,
            data,
            hora
          };

          fetch("https://ponto-eletronico-8bcy.onrender.com/registros", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoRegistro),
          })
            .then((res) => {
              if (!res.ok) throw new Error("Erro ao enviar registro para o servidor.");
              return res.json();
            })
            .then((dados) => {
              setStatus({
                tipo: "sucesso",
                mensagem: dados.mensagem || "Registro enviado com sucesso!",
                hora,
              });

              if (onPontoRegistrado) onPontoRegistrado(novoRegistro);
            })
            .catch((err) => {
              console.error(err);
              setStatus({ tipo: "erro", mensagem: "❌ Erro ao enviar registro." });
            });
        } else {
          setStatus({ tipo: "erro", mensagem: "❌ Fora da geolocalização ou rede não autorizada." });
        }
      },
      () => {
        setStatus({ tipo: "erro", mensagem: "Erro ao obter localização." });
      }
    );
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
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between gap-2 w-full">
        <p className="text-2xl sm:text-4xl font-medium text-center sm:text-left">
          Olá, {usuario.nome}! 👋
        </p>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 text-sm"
        >
          Sair
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 w-full max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <label htmlFor="tipo" className="text-base font-medium text-gray-700">
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
        </div>

        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <button
            onClick={registrarPonto}
            className="px-4 py-2 bg-indigo-900 text-white font-bold rounded hover:bg-indigo-800 transition text-sm whitespace-nowrap w-full sm:w-auto"
          >
            Registrar Ponto
          </button>
        </div>
      </div>

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
