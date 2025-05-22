"use client"

import { useState, useEffect } from "react"

export default function PontoButtonComTipo({ usuario, onLogout, onPontoRegistrado }) {
  const [status, setStatus] = useState(null)
  const [tipo, setTipo] = useState("entrada")
  const [registrosHoje, setRegistrosHoje] = useState([])
  const [tiposRegistradosHoje, setTiposRegistradosHoje] = useState([])
  const [carregando, setCarregando] = useState(false)

  const tiposDisponiveis = [
    { value: "entrada", label: "Entrada" },
    { value: "intervalo-saida", label: "Intervalo / Saída" },
    { value: "intervalo-retorno", label: "Intervalo / Retorno" },
    { value: "saida", label: "Saída" },
    { value: "extra-entrada", label: "Horas Extras Entrada" },
    { value: "extra-saida", label: "Horas Extras Saída" },
  ]

  // Carregar registros do dia atual ao iniciar
  useEffect(() => {
    async function carregarRegistrosHoje() {
      if (!usuario?.email) return

      try {
        setCarregando(true)
        const response = await fetch(`https://ponto-eletronico-8bcy.onrender.com/registros/${usuario.email}`)
        const registros = await response.json()

        // Obter a data atual no formato YYYY-MM-DD
        const hoje = new Date().toLocaleDateString("pt-BR").split("/").reverse().join("-")

        // Filtrar apenas registros de hoje
        const registrosDeHoje = registros.filter((reg) => reg.data === hoje)
        setRegistrosHoje(registrosDeHoje)

        // Extrair os tipos já registrados hoje
        const tipos = registrosDeHoje.map((reg) => reg.tipo)
        setTiposRegistradosHoje(tipos)
      } catch (error) {
        console.error("Erro ao carregar registros:", error)
      } finally {
        setCarregando(false)
      }
    }

    carregarRegistrosHoje()
  }, [usuario?.email])

  async function registrarPonto() {
    // Verificar se o tipo já foi registrado hoje
    if (tiposRegistradosHoje.includes(tipo)) {
      setStatus({
        tipo: "erro",
        mensagem: `❌ Você já registrou ponto de "${tiposDisponiveis.find((t) => t.value === tipo)?.label}" hoje. Não é possível registrar o mesmo tipo de ponto duas vezes no mesmo dia.`,
      })
      return
    }

    setStatus({ tipo: "info", mensagem: "Verificando localização..." })

    if (!navigator.geolocation) {
      setStatus({ tipo: "erro", mensagem: "Seu navegador não suporta geolocalização." })
      return
    }

    // Solicitar permissão de geolocalização com instruções claras
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // Código existente para obter posição e enviar dados
        const { latitude, longitude } = pos.coords
        const agora = new Date()
        const data = agora.toLocaleDateString("pt-BR").split("/").reverse().join("-")
        const hora = agora.toLocaleTimeString()

        const novoRegistro = {
          usuario: usuario.email,
          tipo,
          data,
          hora,
          latitude,
          longitude,
        }

        try {
          const response = await fetch("https://ponto-eletronico-8bcy.onrender.com/registros", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoRegistro),
          })

          const dados = await response.json()

          if (!response.ok) {
            if (response.status === 403) {
              if (dados.mensagem.includes("já registrou")) {
                setStatus({
                  tipo: "erro",
                  mensagem: dados.mensagem,
                })
              } else {
                setStatus({
                  tipo: "erro",
                  mensagem: "❌ Você não está em uma rede autorizada. Entre em contato com o administrador.",
                })
              }
            } else {
              setStatus({ tipo: "erro", mensagem: `❌ ${dados.mensagem || "Erro ao enviar registro."}` })
            }
            return
          }

          // Atualizar a lista de tipos registrados hoje
          setTiposRegistradosHoje([...tiposRegistradosHoje, tipo])

          setStatus({
            tipo: "sucesso",
            mensagem: dados.mensagem || "Registro enviado com sucesso!",
            hora,
          })

          if (onPontoRegistrado) onPontoRegistrado(novoRegistro)

          // Adicionar um pequeno delay antes de recarregar a página
          // para que o usuário possa ver a mensagem de sucesso
          setTimeout(() => {
            window.location.reload()
          }, 1500) // 1.5 segundos de delay
        } catch (err) {
          console.error("Erro na requisição:", err)
          setStatus({
            tipo: "erro",
            mensagem: "❌ Erro de conexão com o servidor. Verifique sua internet.",
          })
        }
      },
      (error) => {
        console.error("Erro ao obter localização:", error)

        // Mensagens específicas para cada código de erro de geolocalização
        let mensagemErro = "❌ Erro ao obter localização."

        switch (error.code) {
          case 1: // PERMISSION_DENIED
            mensagemErro =
              "❌ Permissão de localização negada. Por favor, permita o acesso à sua localização nas configurações do navegador e tente novamente."
            break
          case 2: // POSITION_UNAVAILABLE
            mensagemErro = "❌ Localização indisponível. Verifique se o GPS está ativado."
            break
          case 3: // TIMEOUT
            mensagemErro = "❌ Tempo esgotado ao obter localização. Tente novamente."
            break
        }

        setStatus({ tipo: "erro", mensagem: mensagemErro })
      },
      // Adicionar opções para melhorar a precisão
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  // Adicione esta função após a função registrarPonto()
  function abrirConfiguracoesLocalizacao() {
    // Abrir página de ajuda sobre como permitir localização
    alert(
      "Para permitir acesso à localização:\n\n1. Clique no ícone de cadeado/informações na barra de endereço\n2. Encontre 'Localização' nas permissões\n3. Selecione 'Permitir'\n4. Recarregue a página",
    )
  }

  // Desabilitar tipos já registrados hoje
  const tiposDisponiveisAtualizados = tiposDisponiveis.map((t) => ({
    ...t,
    disabled: tiposRegistradosHoje.includes(t.value),
  }))

  return (
    <div className="w-full max-w-6xl px-4 mx-auto flex flex-col gap-6">
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-between gap-2 w-full">
        <p className="text-2xl sm:text-4xl font-medium text-center sm:text-left">Olá, {usuario.nome}! 👋</p>
        <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 text-sm">
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
            {tiposDisponiveisAtualizados.map((t) => (
              <option key={t.value} value={t.value} disabled={t.disabled} className={t.disabled ? "text-gray-400" : ""}>
                {t.label} {t.disabled ? "(Já registrado)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
          <button
            onClick={registrarPonto}
            disabled={carregando || tiposRegistradosHoje.includes(tipo)}
            className={`px-4 py-2 text-white font-bold rounded transition text-sm whitespace-nowrap w-full sm:w-auto ${
              carregando || tiposRegistradosHoje.includes(tipo)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-900 hover:bg-indigo-800"
            }`}
          >
            {carregando ? "Carregando..." : "Registrar Ponto"}
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
          {status.hora && <div className="text-xs text-gray-500 mt-1">Horário: {status.hora}</div>}

          {/* Botão de ajuda para problemas de localização */}
          {status.tipo === "erro" && status.mensagem.includes("localização") && (
            <button
              onClick={abrirConfiguracoesLocalizacao}
              className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Como permitir localização?
            </button>
          )}
        </div>
      )}

      {/* Resumo dos registros de hoje */}
      {registrosHoje.length > 0 && (
        <div className="mt-4 bg-white p-4 rounded shadow max-w-xl mx-auto w-full">
          <h3 className="text-lg font-medium mb-2">Registros de hoje:</h3>
          <ul className="space-y-2">
            {registrosHoje.map((reg, index) => {
              const tipoLabel = tiposDisponiveis.find((t) => t.value === reg.tipo)?.label || reg.tipo
              return (
                <li key={index} className="flex justify-between items-center border-b pb-1 last:border-0">
                  <span className="font-medium">{tipoLabel}:</span>
                  <span>{reg.hora}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}