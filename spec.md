Componentes de autenticacion:

Formulario de Login

Debe estar basado en este componente

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import logo from '../assets/logo.jpg'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const success = await loginWithCredentials(username, password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center min-vh-100 align-items-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              {/* <h1 className="text-center mb-4">Comedor Hospitalario</h1> */}
              <img
                src={logo}
                alt="Logo"
                className="img-fluid d-block mx-auto mb-4"
                style={{ maxWidth: '150px' }}
              />
              
              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Usuario</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingrese su usuario"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-100">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
                </button>
              </form>

              {error && (
                <div className="alert alert-danger mt-3" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 


Pagina de registro:

la pagina de login debe dividirse en dos mitades:
- mitad izquierda formulario de login
- mitad derecha, breve introduccion y enlace a formulario de registro

este es el endpoint de registro

http://localhost:3000/auth/register-company

y se envia este objto:   {
    "company": { "name": "ACME", "taxId": "20-123", "industryType": "food" },
    "admin": { "email": "admin@acme.com", "password": "Secret123" }
  }

  tacId y industryType son campos opcionales


endpoint de login

http://localhost:3000/auth/login

se envia este objeto 

{
    "username":"acme@ticmeal",
    "password":"Secret123"
}

una vez que el usuario ha iniciado sesion se lo debe dirigir a un dahsboard de este estilo

import React from 'react';
import Layout from '../components/Layout';

const Dashboard = () => {
  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Bienvenido al Sistema de TicMeal de gestión de comedores</h5>
              <p className="card-text">Seleccione una opción del menú lateral para comenzar.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard; 

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import logonavbar from "../assets/logo-navbar.png";

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAdmin = userProfile?.groups?.includes("admin");
  const isKitchen = userProfile?.groups?.includes("cocina");
  const renderMenuItems = () => {
    const menuItems = [];

    // Admin menu items (department.id = 1)
    if (isAdmin) {
      menuItems.push(
        <li key="users" className={isActive('/users') ? 'active' : ''}>
          <Link to="/users" className="d-flex align-items-center p-3 text-white">
            <i className="bi bi-person-gear me-2"></i>
            Usuarios
          </Link>
        </li>,
        // <li key="departments" className={isActive('/departments') ? 'active' : ''}>
        //   <Link to="/departments" className="d-flex align-items-center p-3 text-white">
        //     <i className="bi bi-building me-2"></i>
        //     Departamentos
        //   </Link>
        // </li>,
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
        // <li key="tickets" className={isActive('/tickets') ? 'active' : ''}>
        //   <Link to="/tickets" className="d-flex align-items-center p-3 text-white">
        //     <i className="bi bi-ticket-perforated me-2"></i>
        //     Gestión de Tickets
        //   </Link>
        // </li>,
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

    // Kitchen menu items (department.id = 3)
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

    // Common menu items for all users
    menuItems.push(
      <li key="ticket-validation" className={isActive('/ticket-validation') ? 'active' : ''}>
        <Link to="/ticket-validation" className="d-flex align-items-center p-3 text-white">
          <i className="bi bi-upc-scan me-2"></i>
          Validar Ticket
        </Link>
      </li>
    );

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
                {userProfile?.first_name && userProfile?.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : userProfile?.username || 'Usuario'}
                {userProfile?.department && (
                  <small className="ms-2 text-muted">
                    ({userProfile.department.name})
                  </small>
                )}
              </span>
              <button className="btn btn-outline-danger btn-sm" onClick={logout}>
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