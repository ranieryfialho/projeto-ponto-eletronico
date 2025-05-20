import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
import PontoButtonComTipo from './components/PontoButtonComTipo';
import HistoricoPontosTabela from './components/HistoricoPontosTabela';
import CadastroUsuariosPage from './pages/CadastroUsuariosPage';
import AdminColaboradoresPage from './pages/AdminColaboradoresPage';
import DashboardAdmin from './components/DashboardAdmin';

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
              {/* Rota principal adaptável ao tipo de usuário */}
              <Route
                path="/"
                element={
                  usuario.role === "admin" ? (
                    <DashboardAdmin onLogout={handleLogout} />
                  ) : (
                    <>
                      <PontoButtonComTipo
                        usuario={usuario}
                        onLogout={handleLogout}
                        onPontoRegistrado={() => {}}
                      />
                      <HistoricoPontosTabela usuario={usuario.email} />
                    </>
                  )
                }
              />

              {/* Rota para cadastro de usuários (admin) */}
              {usuario.role === "admin" && (
                <Route
                  path="/admin/cadastro"
                  element={<CadastroUsuariosPage />}
                />
              )}

              {/* Rota para administração de colaboradores (admin) */}
              {usuario.role === "admin" && (
                <Route
                  path="/admin/colaboradores"
                  element={<AdminColaboradoresPage />}
                />
              )}

              {/* Redirecionamento genérico */}
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;