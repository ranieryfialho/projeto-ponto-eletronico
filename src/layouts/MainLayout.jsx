import { useState } from "react";
import { Link } from "react-router-dom";

export default function MainLayout({ children }) {
  const [menuAberto, setMenuAberto] = useState(false);

  // Recupera usuário da sessão
  const usuario = JSON.parse(sessionStorage.getItem("usuario"));

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-indigo-950 text-white p-4 shadow flex justify-between items-center">
        <h1 className="text-xl font-bold">Sistema de Ponto Eletrônico</h1>

        {/* Botão sanduíche (somente admins) */}
        {usuario?.role === 'admin' && (
          <div className="relative">
            <button
              onClick={() => setMenuAberto(!menuAberto)}
              className="text-white bg-indigo-950 px-3 py-1 rounded hover:bg-indigo-800"
            >
              ☰
            </button>
            {menuAberto && (
              <div className="absolute right-0 mt-2 w-56 bg-white shadow rounded text-black z-10">
                <Link
                  to="/"
                  className="block px-4 py-2 hover:bg-indigo-100 border-b"
                  onClick={() => setMenuAberto(false)}
                >
                  Página Inicial
                </Link>
                <Link
                  to="/admin/cadastro"
                  className="block px-4 py-2 hover:bg-indigo-100 border-b"
                  onClick={() => setMenuAberto(false)}
                >
                  Cadastrar Usuário
                </Link>
                <Link
                  to="/admin/colaboradores"
                  className="block px-4 py-2 hover:bg-indigo-100"
                  onClick={() => setMenuAberto(false)}
                >
                  Gerenciar Colaboradores
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 p-4 bg-gray-100">{children}</main>

      <footer className="bg-indigo-950 text-white p-2 text-center">
        <small>&copy;2025 <a href="https://rafiweb.com.br/">Rafi Web</a></small>
      </footer>
    </div>
  );
}
