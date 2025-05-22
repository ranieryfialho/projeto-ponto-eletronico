import { useEffect, useState } from "react"

export default function HistoricoPontosTabela({ usuario }) {
  const [registrosPorData, setRegistrosPorData] = useState({})

  function formatarData(dataString) {
    const [ano, mes, dia] = dataString.split("-")
    return `${dia}/${mes}/${ano}`
  }

  useEffect(() => {
    async function carregarRegistros() {
      if (!usuario) return

      try {
        const res = await fetch(`https://ponto-eletronico-8bcy.onrender.com/registros/${usuario}`)
        const dados = await res.json()

        const agrupado = {}

        dados.forEach(({ tipo, data, hora }) => {
          if (!agrupado[data]) {
            agrupado[data] = {
              entrada: "",
              "intervalo-saida": "",
              "intervalo-retorno": "",
              saida: "",
              "extra-entrada": "",
              "extra-saida": "",
            }
          }

          agrupado[data][tipo] = hora
        })

        setRegistrosPorData(agrupado)
      } catch (err) {
        console.error("Erro ao carregar registros:", err)
      }
    }

    carregarRegistros()
  }, [usuario])

  const colunas = [
    { key: "entrada", label: "Entrada" },
    { key: "intervalo-saida", label: "Intervalo / Saída" },
    { key: "intervalo-retorno", label: "Intervalo / Retorno" },
    { key: "saida", label: "Saída" },
    { key: "extra-entrada", label: "Extras Entrada" },
    { key: "extra-saida", label: "Extras Saída" },
  ]

  const datas = Object.keys(registrosPorData).sort((a, b) => new Date(b) - new Date(a))

  if (datas.length === 0) {
    return <div className="mt-8 text-center text-gray-500 text-sm">Nenhum registro ainda.</div>
  }

  return (
    <div className="overflow-x-auto mt-8 max-w-6xl mx-auto">
      <table className="min-w-full border border-gray-300 text-sm text-center bg-white shadow rounded">
        <thead className="bg-gray-100 font-semibold">
          <tr>
            <th className="border px-2 py-2">📅 Data</th>
            {colunas.map((col) => (
              <th key={col.key} className="border px-2 py-2">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {datas.map((data) => (
            <tr key={data}>
              <td className="border px-2 py-1 font-medium">{formatarData(data)}</td>
              {colunas.map((col) => (
                <td key={col.key} className="border px-2 py-1">
                  {registrosPorData[data][col.key] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}