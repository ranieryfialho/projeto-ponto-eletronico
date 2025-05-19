import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import PontoButtonComTipo from './components/PontoButtonComTipo';
import HistoricoPontosTabela from './components/HistoricoPontosTabela';
import CadastroUsuariosPage from './pages/CadastroUsuariosPage';
import AdminColaboradoresPage from './pages/AdminColaboradoresPage'; // ⬅️ import novo

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const salvo = sessionStorage.getItem("usuario");
    if (salvo) {
      setUsuario(JSON.parse(salvo));
    }
  }, []);

  function handleLogin(dados) {
    setUsuario(dados);
    sessionStorage.setItem("usuario", JSON.stringify(dados));
  }

  function handleLogout() {
    setUsuario(null);
    sessionStorage.removeItem("usuario");
  }

  return (
    <Router>
      <MainLayout>
        <Routes>
          {!usuario ? (
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          ) : (
            <>
              <Route
                path="/"
                element={
                  <>
                    <PontoButtonComTipo
                      usuario={usuario}
                      onLogout={handleLogout}
                      onPontoRegistrado={() => {}}
                    />
                    <HistoricoPontosTabela usuario={usuario.email} />
                  </>
                }
              />

              {/* Rota para cadastro de usuário (apenas admin) */}
              {usuario.role === 'admin' && (
                <Route
                  path="/admin/cadastro"
                  element={<CadastroUsuariosPage />}
                />
              )}

              {/* Rota para gestão de colaboradores (apenas admin) */}
              {usuario.role === 'admin' && (
                <Route
                  path="/admin/colaboradores"
                  element={<AdminColaboradoresPage />}
                />
              )}

              {/* Redireciona qualquer outra rota para a home */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
