import { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function DashboardAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [registros, setRegistros] = useState([]);

    useEffect(() => {
        async function fetchData() {
            const usuariosRes = await fetch("http://localhost:3001/usuarios");
            const registrosRes = await fetch("http://localhost:3001/registros");

            const usuariosData = await usuariosRes.json();
            const registrosData = await registrosRes.json();

            setUsuarios(usuariosData);
            setRegistros(registrosData);
        }

        fetchData();
    }, []);

    const hoje = dayjs().format("YYYY-MM-DD");
    const registrosHoje = registros.filter(reg => reg.data === hoje);
    const totalColaboradores = usuarios.length;
    const pontuaramHoje = [...new Set(registrosHoje.map(r => r.usuarioId))].length;

    return (
        <div style={{ padding: "20px" }}>
            <h1>Dashboard Administrativo</h1>
            <p><strong>Total de colaboradores:</strong> {totalColaboradores}</p>
            <p><strong>Registros de ponto hoje:</strong> {registrosHoje.length}</p>
            <p><strong>Colaboradores que bateram ponto hoje:</strong> {pontuaramHoje}</p>
            <p><strong>Colaboradores que ainda não bateram ponto:</strong> {totalColaboradores - pontuaramHoje}</p>

            <h2>Últimos registros de hoje</h2>
            <table border="1" cellPadding="8">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Horário</th>
                        <th>Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    {registrosHoje.slice(-5).reverse().map((r, index) => {
                        const usuario = usuarios.find(u => u.id === r.usuarioId);
                        return (
                            <tr key={index}>
                                <td>{usuario ? usuario.nome : "Desconhecido"}</td>
                                <td>{r.horario}</td>
                                <td>{r.tipo}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}