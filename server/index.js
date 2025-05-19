import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'registros.json');
const USERS_PATH = path.join(__dirname, 'usuarios.json');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({}));
}

if (!fs.existsSync(USERS_PATH)) {
  fs.writeFileSync(USERS_PATH, JSON.stringify([]));
}

// ---------- REGISTROS ----------

app.post('/registros', (req, res) => {
  const { usuario, tipo, data, hora } = req.body;

  if (!usuario || !tipo || !data || !hora) {
    return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
  }

  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const registros = raw ? JSON.parse(raw) : {};

    if (!registros[usuario]) {
      registros[usuario] = [];
    }

    registros[usuario].push({ tipo, data, hora });

    fs.writeFileSync(DB_PATH, JSON.stringify(registros, null, 2));
    res.status(201).json({ mensagem: `Registro salvo com sucesso para ${usuario}.` });
  } catch (err) {
    console.error('❌ Erro ao salvar registro:', err);
    res.status(500).json({ mensagem: 'Erro ao salvar o registro.' });
  }
});

app.get('/registros', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const registros = JSON.parse(data);
    res.json(registros);
  } catch (err) {
    console.error('❌ Erro ao ler registros:', err);
    res.status(500).json({ mensagem: 'Erro ao ler os registros.' });
  }
});

app.get('/registros/:usuario', (req, res) => {
  const usuario = req.params.usuario;

  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const registros = JSON.parse(data);
    res.json(registros[usuario] || []);
  } catch (err) {
    console.error('❌ Erro ao buscar registros:', err);
    res.status(500).json({ mensagem: 'Erro ao buscar registros.' });
  }
});

// ---------- LOGIN ----------

app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'Email e senha obrigatórios.' });
  }

  try {
    const data = fs.readFileSync(USERS_PATH, 'utf8');
    const usuarios = JSON.parse(data);

    const usuario = usuarios.find(u => u.email === email && u.senha === senha);

    if (usuario) {
      return res.status(200).json({
        mensagem: 'Login autorizado',
        email: usuario.email,
        nome: usuario.nome || '',
        role: usuario.role || 'user',
        cpf: usuario.cpf || ''
      });
    } else {
      return res.status(401).json({ mensagem: 'Email ou senha inválidos.' });
    }
  } catch (err) {
    console.error('❌ Erro ao autenticar:', err);
    res.status(500).json({ mensagem: 'Erro no servidor ao autenticar.' });
  }
});

// ---------- USUÁRIOS ----------

app.post('/usuarios', (req, res) => {
  const { nome, email, senha, cpf, role = 'user' } = req.body;

  if (!nome || !email || !senha || !cpf) {
    return res.status(400).json({ mensagem: 'Nome, email, senha e CPF são obrigatórios.' });
  }

  try {
    const data = fs.existsSync(USERS_PATH) ? fs.readFileSync(USERS_PATH, 'utf8') : '[]';
    const usuarios = JSON.parse(data);

    const existe = usuarios.find(u => u.email === email);
    if (existe) {
      return res.status(409).json({ mensagem: 'Usuário já existe.' });
    }

    usuarios.push({ nome, email, senha, cpf, role });
    fs.writeFileSync(USERS_PATH, JSON.stringify(usuarios, null, 2));

    res.status(201).json({ mensagem: 'Usuário criado com sucesso.' });
  } catch (err) {
    console.error('❌ Erro ao criar usuário:', err);
    res.status(500).json({ mensagem: 'Erro ao criar usuário.' });
  }
});

app.get('/usuarios', (req, res) => {
  try {
    const data = fs.readFileSync(USERS_PATH, 'utf8');
    const usuarios = JSON.parse(data);
    res.json(usuarios);
  } catch (err) {
    console.error('❌ Erro ao ler usuários:', err);
    res.status(500).json({ mensagem: 'Erro ao ler os usuários.' });
  }
});

app.put('/usuarios/:email', (req, res) => {
  const emailParam = req.params.email;
  const novosDados = req.body;

  try {
    const data = fs.readFileSync(USERS_PATH, 'utf8');
    let usuarios = JSON.parse(data);

    const indice = usuarios.findIndex(u => u.email === emailParam);
    if (indice === -1) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    usuarios[indice] = { ...usuarios[indice], ...novosDados };
    fs.writeFileSync(USERS_PATH, JSON.stringify(usuarios, null, 2));
    res.status(200).json({ mensagem: 'Usuário atualizado com sucesso.' });
  } catch (err) {
    console.error('❌ Erro ao atualizar usuário:', err);
    res.status(500).json({ mensagem: 'Erro ao atualizar usuário.' });
  }
});

app.delete('/usuarios/:email', (req, res) => {
  const emailParam = req.params.email;

  try {
    const data = fs.readFileSync(USERS_PATH, 'utf8');
    let usuarios = JSON.parse(data);

    const filtrados = usuarios.filter(u => u.email !== emailParam);
    if (filtrados.length === usuarios.length) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' });
    }

    fs.writeFileSync(USERS_PATH, JSON.stringify(filtrados, null, 2));
    res.status(200).json({ mensagem: 'Usuário deletado com sucesso.' });
  } catch (err) {
    console.error('❌ Erro ao deletar usuário:', err);
    res.status(500).json({ mensagem: 'Erro ao deletar usuário.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});