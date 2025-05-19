import { useEffect, useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    // Bloqueia rolagem da tela apenas na tela de login
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
      });

      const dados = await res.json();

      if (res.ok) {
        onLogin({
          email: dados.email,
          nome: dados.nome,
          role: dados.role,
          cpf: dados.cpf
        });
      } else {
        setMensagem(`❌ ${dados.mensagem}`);
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setMensagem("❌ Erro ao conectar com o servidor.");
    }

    setCarregando(false);
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80 space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-indigo-900 text-white py-2 rounded hover:bg-indigo-800 transition"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
        {mensagem && <p className="text-center text-sm mt-2">{mensagem}</p>}
      </form>
    </div>
  );
}