import { useState } from "react";

export default function PainelCadastroUsuarios() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cpf, setCpf] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleCadastro(e) {
    e.preventDefault();
    setMensagem('');
    setCarregando(true);

    try {
      const res = await fetch("http://localhost:3001/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha, cpf })
      });

      const dados = await res.json();

      if (res.ok) {
        setMensagem("✅ Usuário cadastrado com sucesso!");
        setEmail('');
        setSenha('');
        setCpf('');
      } else {
        setMensagem(`❌ ${dados.mensagem}`);
      }
    } catch (err) {
      console.error("Erro ao cadastrar usuário:", err);
      setMensagem("❌ Erro ao conectar com o servidor.");
    }

    setCarregando(false);
  }

  return (
    <div className="mt-8 max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h3 className="text-xl font-semibold mb-4 text-center">Cadastro de Novo Usuário</h3>
      <form onSubmit={handleCadastro} className="space-y-4">
        <input
          type="email"
          placeholder="Email do usuário"
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
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-indigo-900 text-white py-2 rounded hover:bg-indigo-800 transition"
        >
          {carregando ? "Cadastrando..." : "Cadastrar Usuário"}
        </button>
        {mensagem && <p className="text-center text-sm mt-2">{mensagem}</p>}
      </form>
    </div>
  );
}