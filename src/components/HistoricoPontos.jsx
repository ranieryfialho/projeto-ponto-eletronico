export default function HistoricoPontos({ pontos = [] }) {
    if (pontos.length === 0) {
        return (
            <div className="mt-8 text-center text-gray-500 text-sm">
                Nenhum ponto registrado ainda.
            </div>
        );
    }

    return (
        <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">Histórico de Pontos</h3>

            <ul className="space-y-2 text-sm text-gray-800">
                {pontos
                    .slice()
                    .reverse()
                    .map((registro, index) => {
                        const data = new Date(registro.horario);
                        const horaFormatada = data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const dataFormatada = data.toLocaleDateString();

                        return (
                            <li
                                key={index}
                                className="flex justify-between items-center border-b pb-1"
                            >
                                <span>📍 {dataFormatada}</span>
                                <span>{horaFormatada}</span>
                            </li>
                        );
                    })}
            </ul>
        </div>
    );
}
