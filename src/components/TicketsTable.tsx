import React, { useState, useEffect, useMemo } from 'react';

// 1. Definición de Tipos
interface TicketUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface TicketShift {
    id: number;
    name: string;
}

interface TicketMenuItem {
    id: number;
    name: string;
    iconName: string;
}

interface TicketItem {
    id: number;
    quantity: number;
    menuItem: TicketMenuItem;
}

interface TicketObservation {
    id: number;
    name: string;
    iconName: string;
}

interface Ticket {
    id: number;
    status: string;
    date: string;
    time: string;
    user: TicketUser;
    shift: TicketShift;
    items: TicketItem[];
    observations: TicketObservation[];
    createdAt: string;
}

// Helper para el badge de estado
const getStatusBadge = (status: string) => {
    const badgeMap: { [key: string]: { text: string; className: string } } = {
      pending: { text: 'Pendiente', className: 'bg-warning text-dark' },
      approved: { text: 'Aprobado', className: 'bg-success' },
      rejected: { text: 'Rechazado', className: 'bg-danger' },
      delivered: { text: 'Entregado', className: 'bg-info text-dark' },
      cancelled: { text: 'Cancelado', className: 'bg-secondary' },
    };
    const badge = badgeMap[status.toLowerCase()] || { text: status, className: 'bg-light text-dark' };
    return <span className={`badge ${badge.className}`}>{badge.text}</span>;
};


const TicketsTable: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const stats = useMemo(() => {
        if (!tickets.length) {
            return {
                byShift: {},
                byStatus: {},
                today: 0,
            };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const byShift: { [key: string]: number } = {};
        const byStatus: { [key: string]: number } = {};
        let todayCount = 0;

        for (const ticket of tickets) {
            // Count by shift
            const shiftName = ticket.shift.name;
            byShift[shiftName] = (byShift[shiftName] || 0) + 1;

            // Count by status
            const status = ticket.status.toLowerCase();
            byStatus[status] = (byStatus[status] || 0) + 1;

            // Count for today
            const ticketDate = new Date(ticket.createdAt);
            ticketDate.setHours(0, 0, 0, 0);
            if (ticketDate.getTime() === today.getTime()) {
                todayCount++;
            }
        }

        return { byShift, byStatus, today: todayCount };
    }, [tickets]);


    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No autenticado. Por favor, inicie sesión.");
                }

                const response = await fetch(`${baseUrl}/tickets`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Error: ${response.status}`);
                }

                const data: Ticket[] = await response.json();
                setTickets(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); // Ordenar por más reciente
            } catch (err) {
                setError(err instanceof Error ? err.message : 'No se pudo cargar la lista de tickets.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [baseUrl]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando tickets...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Error al cargar los tickets: {error}
            </div>
        );
    }

    return (
        <div>
            {/* --- Tarjetas de Resumen --- */}
            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card text-center h-100 shadow-sm">
                        <div className="card-body">
                            <h6 className="card-subtitle mb-2 text-muted">Tickets de Hoy</h6>
                            <p className="card-text display-4 fw-bold">{stats.today}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title text-center mb-3">Por Turno</h5>
                            {Object.keys(stats.byShift).length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {Object.entries(stats.byShift).map(([shift, count]) => (
                                        <li key={shift} className="list-group-item d-flex justify-content-between align-items-center">
                                            {shift}
                                            <span className="badge bg-primary rounded-pill">{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-center text-muted">No hay datos</p>}
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title text-center mb-3">Por Estado</h5>
                            {Object.keys(stats.byStatus).length > 0 ? (
                                <ul className="list-group list-group-flush">
                                    {Object.entries(stats.byStatus).map(([status, count]) => (
                                        <li key={status} className="list-group-item d-flex justify-content-between align-items-center">
                                            {getStatusBadge(status)}
                                            <span className="badge bg-secondary rounded-pill">{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-center text-muted">No hay datos</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Tabla de Tickets --- */}
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h4 className="mb-0 text-primary d-flex align-items-center">
                        <i className="bi bi-table me-2"></i>
                        Historial de Tickets Emitidos
                    </h4>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <table className="table table-hover table-striped mb-0 align-middle">
                            <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr>
                                    <th scope="col">ID Ticket</th>
                                    <th scope="col">Usuario</th>
                                    <th scope="col">Turno</th>
                                    <th scope="col">Fecha y Hora</th>
                                    <th scope="col" className="text-center">Estado</th>
                                    <th scope="col">Items</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.length > 0 ? (
                                    tickets.map((ticket) => (
                                        <tr key={ticket.id}>
                                            <td className="fw-bold">#{ticket.id}</td>
                                            <td>
                                                <div>{`${ticket.user.firstName} ${ticket.user.lastName}`}</div>
                                                <small className="text-muted">{ticket.user.email}</small>
                                            </td>
                                            <td>{ticket.shift.name}</td>
                                            <td>{new Date(ticket.createdAt).toLocaleString('es-ES')}</td>
                                            <td className="text-center">{getStatusBadge(ticket.status)}</td>
                                            <td>{ticket.items?.map(item => `${item.quantity} x ${item.menuItem.name.trim()}`).join(', ')}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-5 text-muted">
                                            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                                            No se encontraron tickets.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card-footer bg-white text-muted small">
                    Total de tickets: {tickets.length}
                </div>
            </div>
        </div>
    );
};

export default TicketsTable;