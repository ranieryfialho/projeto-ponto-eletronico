import { useState } from 'react'
import Login from './pages/Login';
import MainLayout from './layouts/MainLayout';
// import PontoButton from './components/PontoButton';

function App() {
  const [usuario, setUsuario] = useState(null);

  return (
    <MainLayout>
      {!usuario ? (
        <Login onLogin={(nome) => setUsuario(nome)} />
      ) : (
        <>
          <p className="text-center mb-4">Bem vindo, {usuario}!</p>
          <div className='bg-white p-6 rounded shadow-md max-w-md mx-auto'>
            <h2 className='text-lg font-semibold mb-4'>Registrar Ponto</h2>
            <p>Este será o local das validações</p>
          </div>
        </>
      )}
      {/* <div className='bg-white p-6 rounded shadow-md max-w-md mx-auto'>
        <h2 className='tex-lg font-semibold mb-4'>Registrar Ponto</h2>
        <p>Este será o local das validações</p>
      </div> */}
    </MainLayout>
  );
}

export default App;
