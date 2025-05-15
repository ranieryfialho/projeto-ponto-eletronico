import { useState } from "react";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');

    async function handleLogin(e) {
        e.preventDefault();

        const res = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        const data = await res.json();

        if (res.ok) {
            setMensagem(data.mensagem);
            onLogin && onLogin(data.usuario);
        } else {
            setMensagem(data.mensagem);
        }
    }

    return (
        <div className="flex items-center justify-center bg-gray-100 overflow-hiden">
            <div className="max-w-sm mx-auto mt-12 p-6 bg-white rounded shadow">
                <h2 className="text-xl text-center font-bold mb-4">Seja Bem-vindo(a)!</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    <button
                        type="submit"
                        className="w-full bg-indigo-950 text-white py-2 rounded hover:bg-indigo-900"
                    >
                        Entrar
                    </button>
                    {mensagem && <p className="text-center text-sm mt-2">{mensagem}</p>}
                </form>
            </div>

        </div>
    );
}