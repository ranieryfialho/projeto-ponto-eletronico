import express from "express"
import cors from "cors"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DB_PATH = path.join(__dirname, "registros.json")
const USERS_PATH = path.join(__dirname, "usuarios.json")

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Garante que os arquivos existam
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}))
if (!fs.existsSync(USERS_PATH)) fs.writeFileSync(USERS_PATH, JSON.stringify([]))

// ---------- FUNÇÃO AUXILIAR ----------

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371 // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // em km
}

// Função para obter o nome do tipo de registro
function getNomeTipo(tipo) {
  const tipos = {
    entrada: "Entrada",
    "intervalo-saida": "Intervalo / Saída",
    "intervalo-retorno": "Intervalo / Retorno",
    saida: "Saída",
    "extra-entrada": "Horas Extras Entrada",
    "extra-saida": "Horas Extras Saída",
  }
  return tipos[tipo] || tipo
}

// ---------- ENDPOINTS ----------

app.post("/registros", (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || ""
  const ipSanitizado = clientIp.replace(/^.*:/, "") // remove "::ffff:"

  const ipsPermitidosPublicos = ["104.28.61.43", "104.28.61.45", "SEU_IP_AQUI"]

  const ipAutorizado =
    ipSanitizado.startsWith("192.168.") ||
    ipSanitizado.startsWith("10.") ||
    ipsPermitidosPublicos.includes(ipSanitizado)

  if (false && !ipAutorizado) {
    return res.status(403).json({ mensagem: "Registro de ponto permitido apenas na rede autorizada." })
  }

  const { usuario, tipo, data, hora, latitude, longitude } = req.body

  if (!usuario || !tipo || !data || !hora || !latitude || !longitude) {
    return res.status(400).json({ mensagem: "Todos os campos são obrigatórios, incluindo localização." })
  }

  const latitudeEscola = -3.7339186410987746
  const longitudeEscola = -38.557118275512366
  const distancia = calcularDistancia(latitude, longitude, latitudeEscola, longitudeEscola)

  if (distancia > 1) {
    return res.status(403).json({ mensagem: "Fora da área permitida para registro de ponto." })
  }

  try {
    const raw = fs.readFileSync(DB_PATH, "utf8")
    const registros = raw ? JSON.parse(raw) : {}

    // Verificar se já existe um registro do mesmo tipo para o usuário no mesmo dia
    if (registros[usuario]) {
      const registroExistente = registros[usuario].find((reg) => reg.data === data && reg.tipo === tipo)
      if (registroExistente) {
        const nomeTipo = getNomeTipo(tipo)
        return res.status(403).json({
          mensagem: `Você já registrou ponto de "${nomeTipo}" hoje às ${registroExistente.hora}. Não é possível registrar o mesmo tipo de ponto duas vezes no mesmo dia.`,
        })
      }
    }

    if (!registros[usuario]) {
      registros[usuario] = []
    }

    registros[usuario].push({
      tipo,
      data,
      hora,
      latitude,
      longitude,
      ip: ipSanitizado,
    })

    fs.writeFileSync(DB_PATH, JSON.stringify(registros, null, 2))
    res.status(201).json({ mensagem: `Registro salvo com sucesso para ${usuario}.` })
  } catch (err) {
    console.error("❌ Erro ao salvar registro:", err)
    res.status(500).json({ mensagem: "Erro ao salvar o registro." })
  }
})

app.get("/registros", (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8")
    res.json(JSON.parse(data))
  } catch (err) {
    console.error("❌ Erro ao ler registros:", err)
    res.status(500).json({ mensagem: "Erro ao ler os registros." })
  }
})

app.get("/registros/:usuario", (req, res) => {
  const usuario = req.params.usuario

  try {
    const data = fs.readFileSync(DB_PATH, "utf8")
    const registros = JSON.parse(data)
    res.json(registros[usuario] || [])
  } catch (err) {
    console.error("❌ Erro ao buscar registros:", err)
    res.status(500).json({ mensagem: "Erro ao buscar registros." })
  }
})

app.post("/login", (req, res) => {
  const { email, senha } = req.body

  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Email e senha obrigatórios." })
  }

  try {
    const data = fs.readFileSync(USERS_PATH, "utf8")
    const usuarios = JSON.parse(data)
    const usuario = usuarios.find((u) => u.email === email && u.senha === senha)

    if (usuario) {
      return res.status(200).json({
        mensagem: "Login autorizado",
        email: usuario.email,
        nome: usuario.nome || "",
        role: usuario.role || "user",
        cpf: usuario.cpf || "",
      })
    } else {
      return res.status(401).json({ mensagem: "Email ou senha inválidos." })
    }
  } catch (err) {
    console.error("❌ Erro ao autenticar:", err)
    res.status(500).json({ mensagem: "Erro no servidor ao autenticar." })
  }
})

app.post("/usuarios", (req, res) => {
  const { nome, email, senha, cpf, role = "user" } = req.body

  if (!nome || !email || !senha || !cpf) {
    return res.status(400).json({ mensagem: "Nome, email, senha e CPF são obrigatórios." })
  }

  try {
    const data = fs.readFileSync(USERS_PATH, "utf8")
    const usuarios = JSON.parse(data)

    if (usuarios.find((u) => u.email === email)) {
      return res.status(409).json({ mensagem: "Usuário já existe." })
    }

    usuarios.push({ nome, email, senha, cpf, role })
    fs.writeFileSync(USERS_PATH, JSON.stringify(usuarios, null, 2))
    res.status(201).json({ mensagem: "Usuário criado com sucesso." })
  } catch (err) {
    console.error("❌ Erro ao criar usuário:", err)
    res.status(500).json({ mensagem: "Erro ao criar usuário." })
  }
})

app.get("/usuarios", (req, res) => {
  try {
    const data = fs.readFileSync(USERS_PATH, "utf8")
    res.json(JSON.parse(data))
  } catch (err) {
    console.error("❌ Erro ao ler usuários:", err)
    res.status(500).json({ mensagem: "Erro ao ler os usuários." })
  }
})

app.put("/usuarios/:email", (req, res) => {
  const emailParam = req.params.email
  const novosDados = req.body

  try {
    const data = fs.readFileSync(USERS_PATH, "utf8")
    const usuarios = JSON.parse(data)
    const indice = usuarios.findIndex((u) => u.email === emailParam)

    if (indice === -1) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." })
    }

    usuarios[indice] = { ...usuarios[indice], ...novosDados }
    fs.writeFileSync(USERS_PATH, JSON.stringify(usuarios, null, 2))
    res.status(200).json({ mensagem: "Usuário atualizado com sucesso." })
  } catch (err) {
    console.error("❌ Erro ao atualizar usuário:", err)
    res.status(500).json({ mensagem: "Erro ao atualizar usuário." })
  }
})

app.delete("/usuarios/:email", (req, res) => {
  const emailParam = req.params.email

  try {
    const data = fs.readFileSync(USERS_PATH, "utf8")
    const usuarios = JSON.parse(data)
    const novosUsuarios = usuarios.filter((u) => u.email !== emailParam)

    if (novosUsuarios.length === usuarios.length) {
      return res.status(404).json({ mensagem: "Usuário não encontrado." })
    }

    fs.writeFileSync(USERS_PATH, JSON.stringify(novosUsuarios, null, 2))
    res.status(200).json({ mensagem: "Usuário deletado com sucesso." })
  } catch (err) {
    console.error("❌ Erro ao deletar usuário:", err)
    res.status(500).json({ mensagem: "Erro ao deletar usuário." })
  }
})

// Endpoint para baixar o arquivo registros.json
app.get("/download/registros", (req, res) => {
  try {
    const filePath = path.join(__dirname, "registros.json")
    res.download(filePath, "registros.json")
  } catch (err) {
    console.error("❌ Erro ao baixar registros:", err)
    res.status(500).json({ mensagem: "Erro ao baixar os registros." })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})