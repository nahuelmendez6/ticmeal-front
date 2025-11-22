import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import logonavbar from '../assets/react.svg'; // Placeholder, replace with actual logo

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Colapsar en pantallas pequeñas
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 🔑 CORRECCIÓN CLAVE: Verificar el rol usando la propiedad 'role'
  // El rol viene como una cadena de texto (ej: "company_admin").
  const isAdmin = userProfile?.role === 'company_admin';
  const isKitchen = userProfile?.role === 'cocina'; // Asumiendo 'cocina' es el rol
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
        <li key="tickets-table" className={isActive('/tickets-table') ? 'active' : ''}>
          <Link to="/tickets-table" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-table me-2"></i>
            Tabla de Tickets
          </Link>
        </li>,
        <li key="menu" className={isActive('/menu') ? 'active' : ''}>
          <Link to="/menu" className="d-flex align-items-center p-3 text-white">
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
            style={{ maxWidth: '150px' }}
          />
        </div>

        <ul className="list-unstyled components">
          {renderMenuItems()}
        </ul>
      </nav>

      {/* Page Content */}
      <div id="content" className={sidebarCollapsed ? 'sidebar-collapsed' : ''}>
        {/* Navbar */}
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
          <div className="container-fluid">
            <button type="button" id="sidebarCollapse" className="btn btn-dark" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>
            <div className="ms-auto d-flex align-items-center">
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