import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import {
  Coffee, Apple, Pizza, Beef, Salad, Soup, Utensils, Wine,
  Banana, Cookie, Croissant, CupSoda, CakeSlice, Beer, Donut, EggFried,
  GlassWater, Milk, IceCream, Drumstick, Ham, Hamburger, AlertTriangle, BottleWine, Sandwich
} from 'lucide-react';

// --- Icon Mapping ---
const iconMap: { [key: string]: React.ElementType } = { Coffee, Sandwich: Sandwich, Apple, Pizza, Beef, Salad, Soup, Utensils, Wine, Banana, Cookie, Croissant, CupSoda, CakeSlice, Beer, Donut, Egg: EggFried, EggFried, GlassWater, Milk, IceCream, Drumstick, Ham, Burger: Hamburger, Hamburger, BottleWine: BottleWine };

// --- Interfaces ---
interface TicketUser {
  id: number;
  firstName: string;
  lastName: string;
}

interface TicketShift {
  id: number;
  name: string;
}

interface TicketMenuItem {
  id: number;
  name: string;
}

interface TicketObservation {
  id: number;
  description: string;
}

interface Ticket {
  id: number;
  status: string;
  date: string;
  time: string;
  user: TicketUser;
  shift: TicketShift;
  menuItems: TicketMenuItem[];
  observations: TicketObservation[];
  createdAt: string;
}

// --- Icon Component ---
const MenuItemIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = iconMap[iconName] || AlertTriangle;
  return <Icon size={40} />;
};

const SOCKET_URL = 'http://localhost:3000/tickets';

const TicketCard: React.FC<{ ticket: Ticket; onMarkAsUsed: (id: number) => void; isUpdating: boolean }> = ({ ticket, onMarkAsUsed, isUpdating }) => {
  const getStatusBadge = (status: string) => {
    const badgeMap: { [key: string]: { text: string; className: string } } = {
      pending: { text: 'Pendiente', className: 'bg-warning text-dark' },
      approved: { text: 'Aprobado', className: 'bg-success' },
      used: { text: 'Usado', className: 'bg-primary' },
      rejected: { text: 'Rechazado', className: 'bg-danger' },
      delivered: { text: 'Entregado', className: 'bg-info' },
      cancelled: { text: 'Cancelado', className: 'bg-secondary' },
    };
    const badge = badgeMap[status] || { text: status, className: 'bg-light text-dark' };
    return <span className={`badge fs-6 ${badge.className}`}>{badge.text}</span>;
  };

  const formattedTicketId = `${ticket.shift?.name?.charAt(0).toUpperCase() || 'T'}-${ticket.id}`;

  const fecha = new Date(ticket.date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Agrupar items para mostrar cantidades
  const groupedItems = ticket.menuItems.reduce((acc, item) => {
    const existing = acc.get(item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      acc.set(item.id, {
        name: item.name,
        quantity: 1,
        iconName: 'Utensils', // Default icon as we don't have the full menu definition here
      });
    }
    return acc;
  }, new Map<number, { name: string; quantity: number; iconName: string }>());

  const isClickable = ticket.status !== 'used' && ticket.status !== 'cancelled' && ticket.status !== 'rejected';

  return (
    // Se recomienda añadir estilos para .ticket-clickable:hover para dar feedback visual, por ejemplo:
    // .ticket-clickable:hover { transform: translateY(-5px); box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important; }
    <div 
      className={`card shadow-lg h-100 ${isClickable ? 'ticket-clickable' : ''}`}
      onClick={() => isClickable && !isUpdating && onMarkAsUsed(ticket.id)}
      style={{ cursor: isClickable && !isUpdating ? 'pointer' : 'default', position: 'relative' }}
    >
      {isUpdating && (
        <div className="card-img-overlay d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 10 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Actualizando...</span>
          </div>
        </div>
      )}
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold mb-0 text-primary">
                #{formattedTicketId}
            </h3>
            {getStatusBadge(ticket.status)}
        </div>

        <div className="text-start mt-3">
            <p style={{ fontSize: '1.1rem' }}><strong>Nombre:</strong> {ticket.user?.firstName} {ticket.user?.lastName}</p>
            <p style={{ fontSize: '1.1rem' }}><strong>Turno:</strong> {ticket.shift?.name}</p>
            <p style={{ fontSize: '1.1rem' }}><strong>Fecha:</strong> {fecha}</p>
            <p style={{ fontSize: '1.1rem' }}><strong>Hora:</strong> {ticket.time}</p>
        </div>

        {groupedItems.size > 0 && (
            <div className="mt-3 text-start">
                <h6 className="text-secondary">Ítems seleccionados:</h6>
                <ul className="list-group list-group-flush">
                {Array.from(groupedItems.entries()).map(([id, item]) => (
                    <li key={id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <div className="d-flex align-items-center">
                        <MenuItemIcon iconName={item.iconName} />
                        <span className="ms-2">{item.name}</span>
                    </div>
                    <span className="badge bg-primary rounded-pill fs-6">
                        {item.quantity}
                    </span>
                    </li>
                ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export const TicketMonitor: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [updatingTicketId, setUpdatingTicketId] = useState<number | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Conectado al servidor de Tickets:', socket.id);
    });

    socket.on('newTicket', (newTicket: Ticket) => {
      console.log('Nuevo ticket recibido:', newTicket);
      setTickets((prevTickets) => [newTicket, ...prevTickets]);
    });

    socket.on('ticketUpdated', (updatedTicket: Ticket) => {
      console.log('Ticket actualizado:', updatedTicket);
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === updatedTicket.id ? updatedTicket : ticket
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleMarkAsUsed = async (ticketId: number) => {
    if (updatingTicketId) return; // Prevenir múltiples actualizaciones
    setUpdatingTicketId(ticketId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3000/tickets/${ticketId}/use`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al marcar el ticket como usado.');
      }
      // El backend emitirá un evento 'ticketUpdated', que será capturado por el listener del socket.
    } catch (error) {
      console.error('Error marking ticket as used:', error);
      alert(error instanceof Error ? error.message : 'Ocurrió un error.');
    } finally {
      setUpdatingTicketId(null);
    }
  };

  return (
    <div className="container py-5">
      <h2 className="text-center mb-5">Monitor de Cocina - Tickets en Tiempo Real</h2>
      <div className="row g-4">
        {tickets.length === 0 ? (
            <div className="col-12 text-center">
                <div className="alert alert-info">
                    Esperando nuevos tickets...
                </div>
            </div>
        ) : (
            tickets.map((ticket) => (
                <div key={ticket.id} className="col-12 col-md-6 col-lg-4">
                    <TicketCard 
                      ticket={ticket} 
                      onMarkAsUsed={handleMarkAsUsed}
                      isUpdating={updatingTicketId === ticket.id}
                    />
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default TicketMonitor;