import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import logo from '../assets/react.svg'; // Placeholder, replace with actual logo

interface LoginProps {
  showRegisterLink?: boolean;
}

const Login: React.FC<LoginProps> = ({ showRegisterLink = true }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginWithCredentials } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await loginWithCredentials(username, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Error al iniciar sesión');
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

              {showRegisterLink && (
                <div className="mt-3 text-center">
                  <p className="text-muted">
                    ¿No tiene una cuenta?{' '}
                    <Link to="/register" className="text-primary">
                      Regístrese aquí
                    </Link>
                  </p>
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

