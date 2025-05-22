"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import dayjs from "dayjs"

export default function AdminRegistrosPage() {
  const [registros, setRegistros] = useState({})
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [filtroUsuario, setFiltroUsuario] = useState("")
  const [filtroData, setFiltroData] = useState("")

  useEffect(() => {
    async function carregarRegistros() {
      try {
        setCarregando(true)
        const response = await fetch("https://ponto-eletronico-8bcy.onrender.com/registros")

        if (!response.ok) {
          throw new Error(`Erro ao carregar registros: ${response.status}`)
        }

        const dados = await response.json()
        setRegistros(dados)
        setErro(null)
      } catch (error) {
        console.error("Erro ao carregar registros:", error)
        setErro("Falha ao carregar os registros. Verifique sua conexão.")
      } finally {
        setCarregando(false)
      }
    }

    carregarRegistros()
  }, [])

  // Função para exportar registros como JSON
  function exportarJSON() {
    const dadosJSON = JSON.stringify(registros, null, 2)
    const blob = new Blob([dadosJSON], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `registros-ponto-${dayjs().format("YYYY-MM-DD")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Função para exportar registros como CSV
  function exportarCSV() {
    // Preparar cabeçalho do CSV
    let csv = "Email,Data,Hora,Tipo,Latitude,Longitude,IP\n"

    // Adicionar linhas para cada registro
    Object.entries(registros).forEach(([email, listaRegistros]) => {
      listaRegistros.forEach((reg) => {
        csv += `"${email}","${reg.data}","${reg.hora}","${reg.tipo}","${reg.latitude}","${reg.longitude}","${reg.ip || ""}"\n`
      })
    })

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `registros-ponto-${dayjs().format("YYYY-MM-DD")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Filtrar registros
  const registrosFiltrados = {}
  Object.entries(registros).forEach(([email, listaRegistros]) => {
    // Filtrar por usuário
    if (filtroUsuario && !email.toLowerCase().includes(filtroUsuario.toLowerCase())) {
      return
    }

    // Filtrar registros por data
    const registrosFiltradosPorData = filtroData
      ? listaRegistros.filter((reg) => reg.data === filtroData)
      : listaRegistros

    if (registrosFiltradosPorData.length > 0) {
      registrosFiltrados[email] = registrosFiltradosPorData
    }
  })

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Registros de Ponto</h2>
        <Link to="/" className="bg-indigo-900 text-white px-4 py-2 rounded hover:bg-indigo-800">
          Voltar ao Dashboard
        </Link>
      </div>

      {erro && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{erro}</div>}

      {/* Filtros */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Usuário:</label>
            <input
              type="text"
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              placeholder="Email do usuário"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Data:</label>
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Botões de exportação */}
      <div className="flex gap-3 mb-6">
        <button onClick={exportarJSON} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Exportar JSON
        </button>
        <button onClick={exportarCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Exportar CSV
        </button>
      </div>

      {/* Exibição dos registros */}
      {carregando ? (
        <div className="text-center py-8">Carregando registros...</div>
      ) : Object.keys(registrosFiltrados).length === 0 ? (
        <div className="text-center py-8 bg-white rounded shadow">
          Nenhum registro encontrado com os filtros aplicados.
        </div>
      ) : (
        Object.entries(registrosFiltrados).map(([email, listaRegistros]) => (
          <div key={email} className="mb-8 bg-white rounded shadow overflow-hidden">
            <h3 className="bg-gray-100 p-3 font-semibold border-b">Usuário: {email}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {listaRegistros.map((registro, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registro.data.split("-").reverse().join("/")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.hora}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {registro.tipo.replace(/-/g, " ")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={`https://www.google.com/maps?q=${registro.latitude},${registro.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Ver no mapa
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{registro.ip || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  )
}