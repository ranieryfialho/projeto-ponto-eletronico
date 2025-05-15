import { useState, useEffect } from 'react';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';

function App() {
  const [usuario, setUsuario] = useState(null);

  // Recupera do localStorage ao carregar
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      setUsuario(usuarioSalvo);
    }
  }, []);

  // Função de login
  function handleLogin(nome) {
    setUsuario(nome);
    localStorage.setItem('usuario', nome);
  }

  // Função de logout
  function handleLogout() {
    setUsuario(null);
    localStorage.removeItem('usuario');
  }

  return (
    <MainLayout>
      {!usuario ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <div className="flex items-center justify-center gap-18 mb-4">
            <p className="text-xl font-medium text-center">
              Bem-vindo, {usuario}! 👋
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition duration-300"
            >
              Sair
            </button>
          </div>

          <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Registrar Ponto</h2>
            <p>Este será o local das validações</p>
          </div>
        </>
      )}
    </MainLayout>
  );
}

export default App;
