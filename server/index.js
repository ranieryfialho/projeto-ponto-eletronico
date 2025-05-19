import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Corrige __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do arquivo JSON
const DB_PATH = path.join(__dirname, 'registros.json');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Garante que o arquivo registros.json exista
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

// POST /registros → recebe e salva um novo registro
app.post('/registros', (req, res) => {
  const novoRegistro = req.body;

  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const registros = JSON.parse(data);

    registros.push(novoRegistro);

    fs.writeFileSync(DB_PATH, JSON.stringify(registros, null, 2));

    res.status(201).json({ mensagem: 'Registro salvo com sucesso no servidor.' });
  } catch (err) {
    console.error('Erro ao salvar registro:', err);
    res.status(500).json({ mensagem: 'Erro ao salvar o registro.' });
  }
});

// (Opcional) GET /registros → retorna todos os registros
app.get('/registros', (req, res) => {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    const registros = JSON.parse(data);
    res.json(registros);
  } catch (err) {
    console.error('Erro ao ler registros:', err);
    res.status(500).json({ mensagem: 'Erro ao ler os registros.' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});