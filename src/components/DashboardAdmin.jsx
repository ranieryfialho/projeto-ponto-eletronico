import { useEffect, useState } from "react"
import dayjs from "dayjs"

export default function DashboardAdmin() {
  const [usuarios, setUsuarios] = useState([])
  const [registros, setRegistros] = useState({})

  useEffect(() => {
    async function fetchData() {
      const usuariosRes = await fetch("http://localhost:3001/usuarios")
      const registrosRes = await fetch("http://localhost:3001/registros")

      const usuariosData = await usuariosRes.json()
      const registrosData = await registrosRes.json()

      setUsuarios(usuariosData)
      setRegistros(registrosData)
    }

    fetchData()
  }, [])

  const hoje = dayjs().format("YYYY-MM-DD")

  const colaboradores = usuarios.filter((u) => u.role === "user")
  const registrosHoje = Object.entries(registros).flatMap(([email, lista]) =>
    lista.filter((reg) => reg.data === hoje).map((reg) => ({ email, ...reg })),
  )

  const emailsRegistraram = new Set(registrosHoje.map((r) => r.email))
  const pontuaramHoje = [...emailsRegistraram].filter((email) =>
    colaboradores.some((colab) => colab.email === email),
  ).length

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-gray-100 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
            <span role="img" aria-label="gráfico">
              📈
            </span>{" "}
            Dashboard Administrativo
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            <InfoCard title="Total de colaboradores" value={colaboradores.length} />
            <InfoCard title="Registros de ponto hoje" value={registrosHoje.length} />
            <InfoCard title="Colaboradores que bateram ponto" value={pontuaramHoje} />
            <InfoCard title="Ainda não bateram ponto" value={colaboradores.length - pontuaramHoje} />
          </div>

          <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span role="img" aria-label="relógio">
              🕒
            </span>{" "}
            Últimos registros de hoje
          </h2>

          <div className="bg-white rounded-lg shadow mb-6">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-blue-950 text-white">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium uppercase">Email</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium uppercase">Horário</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-medium uppercase">Tipo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrosHoje
                    .slice(-5)
                    .reverse()
                    .map((r, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 truncate max-w-[200px]">{r.email}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700">{r.hora}</td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 capitalize">
                          {r.tipo.replace("-", " ")}
                        </td>
                      </tr>
                    ))}
                  {registrosHoje.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 sm:px-6 py-4 text-sm text-gray-500 text-center">
                        Nenhum registro encontrado para hoje
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ title, value }) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold text-blue-600 mt-2">{value}</h2>
    </div>
  )
}