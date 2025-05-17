import { useState, useEffect } from 'react';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import PontoButtonComTipo from './components/PontoButtonComTipo';
import HistoricoPontosTabela from './components/HistoricoPontosTabela';

function App() {
  const [usuario, setUsuario] = useState(null);

  const [registros, setRegistros] = useState(() => {
    return JSON.parse(localStorage.getItem("registrosPontoDetalhado")) || [];
  });

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario');
    if (usuarioSalvo) {
      setUsuario(usuarioSalvo);
    }
  }, []);

  function adicionarPonto(novoRegistro) {
    const atualizados = [...registros, novoRegistro];
    setRegistros(atualizados);
    localStorage.setItem("registrosPontoDetalhado", JSON.stringify(atualizados));
  }

  function handleLogin(nome) {
    setUsuario(nome);
    localStorage.setItem('usuario', nome);
  }

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
          <PontoButtonComTipo
            usuario={usuario}
            onLogout={handleLogout}
            onPontoRegistrado={adicionarPonto}
          />
          <HistoricoPontosTabela registros={registros} />
        </>
      )}
    </MainLayout>
  );
}

export default App; 