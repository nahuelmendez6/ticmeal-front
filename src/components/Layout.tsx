import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import { Bell } from 'lucide-react';

import logonavbar from '../assets/sidebar-logo.png'; // Placeholder, replace with actual logo

interface LayoutProps {
  children: React.ReactNode;
}

// Se añade la interfaz Ticket aquí para que esté disponible para los eventos de socket
interface Ticket {
  id: number;
  status: string;
  date: string;
  time: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  };
  shift: {
    id: number;
    name: string;
  };
  menuItems: { id: number; name: string; iconName: string }[];
  observations: { id: number; name: string; iconName: string }[];
  createdAt: string;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle window resize
  useEffect(() => {
    // Variable to track the screen size category (small/large) to avoid re-renders on every pixel change.
    let isSmall = window.innerWidth <= 810;
    setSidebarCollapsed(isSmall);

    const handleResize = () => {
      const newIsSmall = window.innerWidth <= 810;
      // Only update state when crossing the breakpoint to avoid overriding manual toggles.
      if (newIsSmall !== isSmall) {
        isSmall = newIsSmall;
        setSidebarCollapsed(newIsSmall);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Conexión a Socket.IO para notificaciones
  useEffect(() => {
    // Intentar obtener companyId de propiedades directas o anidadas (común en TypeORM)
    let companyId = (userProfile as any)?.companyId || (userProfile as any)?.company?.id;
    
    // Fallback: Si no está en el perfil, intentar decodificarlo del token JWT almacenado
    if (!companyId) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          companyId = payload.companyId;
        } catch (e) {
          console.error('[Layout] Error decodificando token para obtener companyId:', e);
        }
      }
    }

    console.log('[Layout] Verificando conexión socket. Profile:', userProfile, 'CompanyId:', companyId);

    if (!companyId) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // Aseguramos que no haya doble barra si la URL base termina en /
    const cleanUrl = socketUrl.replace(/\/$/, '');
    
    // Conectamos al namespace '/tickets' definido en el Gateway
    const socket = io(`${cleanUrl}/tickets`, {
      query: {
        companyId: companyId // Se envía para que el backend nos una a la sala 'company_X'
      },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('[Layout] Socket conectado correctamente. ID:', socket.id, 'Sala:', `company_${companyId}`);
    });

    socket.on('connect_error', (err) => {
      console.error('[Layout] Error de conexión al socket de tickets:', err);
    });

    socket.on('lowStockAlert', (payload) => {
      // console.warn('⚠️ Alerta de Stock:', payload);
      setNotifications((prev) => [payload, ...prev]);
    });

    // --- UNIFICACIÓN DE EVENTOS DE TICKETS ---
    // Escuchar nuevos tickets y emitir un evento global para que otros componentes (como TicketMonitor) reaccionen
    socket.on('newTicket', (ticket: Ticket) => {
      console.log('[Layout] Nuevo ticket recibido via socket:', ticket);
      window.dispatchEvent(new CustomEvent('newTicket', { detail: ticket }));
    });

    socket.on('ticketUpdated', (updatedTicket: Ticket) => {
      console.log('[Layout] Ticket actualizado via socket:', updatedTicket);
      window.dispatchEvent(new CustomEvent('ticketUpdated', { detail: updatedTicket }));
    });

    return () => {
      socket.disconnect();
    };
  }, [userProfile]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 🔑 CORRECCIÓN CLAVE: Verificar el rol usando la propiedad 'role'
  // El rol viene como una cadena de texto (ej: "company_admin").
  const isAdmin = userProfile?.role === 'company_admin';
  const isKitchen = userProfile?.role === 'kitchen_admin';
  const isEmployee = !!userProfile?.role; // Asumimos que si hay un rol, es un empleado base

  // console.log('User Profile:', userProfile); // Puedes mantener este log para debug
  // console.log(`isAdmin: ${isAdmin}, isKitchen: ${isKitchen}`); // Log de permisos

  const renderMenuItems = () => {
    const menuItems: React.ReactNode[] = [];

    // Menú de Administrador
    if (isAdmin) {
      menuItems.push(
        <li key="users" className={isActive('/users') ? 'active' : ''}>
          <Link to="/users" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-person-gear me-2"></i>
            Usuarios
          </Link>
        </li>,
        <li key="shifts" className={isActive('/shifts') ? 'active' : ''}>
          <Link to="/shifts" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-clock-history me-2"></i>
            Turnos
          </Link>
        </li>,
        <li key="menu" className={isActive('/menu-management') ? 'active' : ''}>
          <Link to="/menu-management" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-journal-text me-2"></i>
            Menú
          </Link>
        </li>,
        <li key="reports" className={isActive('/reports') ? 'active' : ''}>
          <Link to="/reports" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-bar-chart me-2"></i>
            Reportes
          </Link>
        </li>
      );
    }

    // Menú de Cocina
    if (isKitchen) {
      menuItems.push(
        <li key="ticket-list" className={isActive('/ticket-list') ? 'active' : ''}>
          <Link to="/ticket-list" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-list-ul me-2"></i>
            Lista de Tickets
          </Link>
        </li>,
                <li key="shifts" className={isActive('/shifts') ? 'active' : ''}>
          <Link to="/shifts" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-clock-history me-2"></i>
            Turnos
          </Link>
        </li>,
        <li key="menu" className={isActive('/menu-management') ? 'active' : ''}>
          <Link to="/menu-management" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-journal-text me-2"></i>
            Menú
          </Link>
        </li>,
        <li key="kitchen-ticket-create" className={isActive('/kitchen-ticket-create') ? 'active' : ''}>
          <Link to="/kitchen-ticket-create" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-plus-square me-2"></i>
            Crear Ticket Manual
          </Link>
        </li>
      );
      menuItems.push(
        <li key="ticket-monitor" className={isActive('/ticket-monitor') ? 'active' : ''}>
          <Link to="/ticket-monitor" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-tv me-2"></i>
            Monitor de Cocina
          </Link>
        </li>
      );
    }

    // Funcionalidad Común (Generalmente disponible para cualquier usuario)
    if (isEmployee) {
        menuItems.push(
          <li key="ticket-validation" className={isActive('/ticket-validation') ? 'active' : ''}>
            <Link to="/ticket-validation" className="d-flex align-items-center p-3 text-white">
              <i className="bi bi-upc-scan me-2"></i>
              Validar Ticket
            </Link>
          </li>
        );
        menuItems.push(
            <li key="active-shift-form" className={isActive('/active-shift') ? 'active' : ''}>
              <Link to="/active-shift" className="d-flex align-items-center p-3 text-white">
                <i className="bi bi-card-checklist me-2"></i> Pedido de Turno
              </Link>
            </li>)
    }

    return menuItems;
  };

  return (
    <div className="wrapper">
      {/* Sidebar */}
      <nav id="sidebar" className={`bg-dark text-white ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header p-3">
          <img
            src={logonavbar}
            alt="Logo"
            className="img-fluid d-block mx-auto mb-4"
            style={{ maxWidth: '200px' }}
          />
        </div>

        <ul className="list-unstyled components">
          {renderMenuItems()}
        </ul>
      </nav>

      {/* Page Content */}
      <div id="content" className={sidebarCollapsed ? 'sidebar-collapsed' : ''}>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm" style={{ position: 'relative', zIndex: 1045 }}>
          <div className="container-fluid">
            <button type="button" id="sidebarCollapse" className="btn btn-dark" onClick={toggleSidebar} style={{ display: 'inline-block' }}>
              <i className="bi bi-list"></i>
            </button>
            <div className="ms-auto d-flex align-items-center">
              
              {/* Notificaciones */}
              <div className="dropdown me-3 position-relative">
                <button 
                  className="btn btn-light position-relative border-0 bg-transparent" 
                  onClick={() => setShowNotifications(!showNotifications)}
                  type="button"
                >
                  <Bell size={20} className="text-secondary" />
                  {notifications.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                      {notifications.length}
                    </span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="dropdown-menu show p-0 shadow border-0 end-0" style={{ position: 'absolute', width: '300px', right: 0, left: 'auto', zIndex: 1000 }}>
                    <div className="card border-0">
                      <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
                        <h6 className="mb-0 small fw-bold">Notificaciones</h6>
                        {notifications.length > 0 && (
                          <button className="btn btn-link btn-sm p-0 text-decoration-none" style={{ fontSize: '0.8rem' }} onClick={() => setNotifications([])}>
                            Limpiar
                          </button>
                        )}
                      </div>
                      <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="p-3 text-center text-muted small">
                            No hay notificaciones nuevas
                          </div>
                        ) : (
                          notifications.map((notif, idx) => (
                            <div key={idx} className="list-group-item list-group-item-action p-2">
                              <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                                <strong className="text-danger small">Stock Bajo</strong>
                                <small className="text-muted" style={{ fontSize: '0.7rem' }}>Ahora</small>
                              </div>
                              <p className="mb-1 small text-dark">
                                {notif.name}: {notif.currentStock} {notif.unit}
                              </p>
                              <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Mínimo requerido: {notif.minStock} {notif.unit}
                              </small>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <span className="me-3 text-dark">
                <i className="bi bi-person-circle me-2"></i>
                {/* Asumimos que userProfile.username siempre está presente después del login */}
                {userProfile?.username || 'Usuario'} 
                {/* ℹ️ Muestra el rol si está presente, ya que el backend lo devuelve */}
                {userProfile?.role && (
                  <small className="ms-2 text-muted">
                    ({userProfile.role})
                  </small>
                )}
              </span>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                <i className="bi bi-box-arrow-right"></i> Salir
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="container-fluid p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;