import express from "express";
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Usuario simulado
const users = [
    {
        id: 1,
        email: 'ranieryfialho@gmail.com',
        senha: '123456',
        nome: 'Admin'
    },
];

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const user = users.find(u => u.email === email && u.senha === senha);

    if (!user) {
        return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }

    return res.json({ mensagem: 'Login realizado com sucesso', usuario: user.nome});
});

app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001');
});