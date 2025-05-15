export default function MainLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-indigo-950 text-white p-4 shadow">
                <h1 className="text-xl font-bold">Sistema de Ponto Eletrônico</h1>
            </header>

            <main className="flex-1 p-4 bg-gray-100">
                {children}
            </main>

            <footer className="bg-indigo-950 text-white p-2 text-center">
                <small>&copy; 2025 Sênior Escola de Profissões</small>
            </footer>
        </div>
    );
}