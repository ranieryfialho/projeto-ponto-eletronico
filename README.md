# 🕒 Sistema de Ponto Eletrônico

Um sistema web simples e funcional para controle de ponto eletrônico, com dashboard administrativo, registro de horários e gestão de colaboradores.

---

## 🚀 Funcionalidades

- ✅ Login de usuários (colaboradores e administradores)
- ✅ Registro de ponto: entrada, intervalo, retorno e saída
- ✅ Visualização de histórico de registros por usuário
- ✅ Dashboard administrativo com resumo e últimos registros
- ✅ Cadastro e gerenciamento de colaboradores (admin)
- ✅ Logout com segurança

---

## 🖥️ Tecnologias Utilizadas

### Frontend
- [React](https://reactjs.org/)
- [React Router DOM](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Day.js](https://day.js.org/)

### Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- Dados persistidos em arquivos JSON (`usuarios.json` e `registros.json`)

---

## 📁 Estrutura de Pastas

```
projeto-ponto-eletronico/
├── public/ # Arquivos estáticos
├── server/ # Backend (Node + JSON como DB)
│ ├── index.js # Servidor Express
│ ├── registros.json # Registros de ponto (por e-mail)
│ └── usuarios.json # Usuários cadastrados (admin e user)
├── src/ # Frontend React + Tailwind
│ ├── components/ # Componentes reutilizáveis (Dashboard, Botões etc.)
│ ├── layouts/ # Layout principal da aplicação
│ ├── pages/ # Páginas principais (Login, Admin)
│ ├── App.jsx # Gerenciador de rotas
│ └── main.jsx # Ponto de entrada da aplicação React
```

---

## ⚙️ Como Rodar o Projeto Localmente

### 1. Clone o repositório

```
git clone https://github.com/seu-usuario/ponto-eletronico.git
cd ponto-eletronico
```
### 2. Clone o repositório
```
npm install
```

### 2. Inicie o servidor backend
```
cd server
node index.js
```

🔐 Contas de Teste
Você pode usar os seguintes logins fictícios para testes:

Admin
Email: admin@empresa.com

Senha: 123456


📌 Melhorias Futuras
Exportar registros em PDF/Excel

Filtros por período e colaborador

Gráficos no dashboard

Confirmação e som ao bater ponto

Autenticação com JWT (futuramente)
