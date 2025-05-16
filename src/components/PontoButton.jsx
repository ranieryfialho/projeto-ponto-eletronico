import { useState } from "react";

export default function PontoButton() {
  const [status, setStatus] = useState("");

  function registrarPonto() {
    setStatus("Verificando rede e localização...");

    if (!navigator.geolocation) {
      setStatus("Seu navegador não suporta geolocalização.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        const latEmpresa = -3.7280086504083974;
        const lonEmpresa = -38.54865675887715;
        const distancia = calcularDistancia(latitude, longitude, latEmpresa, lonEmpresa);

        const emRedePermitida = true; // simulação

        if (distancia <= 0.1 && emRedePermitida) {
          setStatus("✅ Ponto registrado com sucesso!");
        } else {
          setStatus("❌ Fora da geolocalização permitida ou rede incorreta.");
        }
      },
      () => {
        setStatus("Erro ao obter localização.");
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
    <div className="text-center space-y-4 mt-6">
      <button
        onClick={registrarPonto}
        className="px-6 py-3 bg-indigo-900 text-white font-bold rounded hover:bg-indigo-800 transition"
      >
        Registrar Ponto
      </button>
      {status && <p className="text-sm text-gray-700">{status}</p>}
    </div>
  );
}
