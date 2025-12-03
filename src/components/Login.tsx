import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import logo from '../assets/logo.png';
import loginImg from '../assets/login-img.png';

interface LoginProps {
  showRegisterLink?: boolean;
} 

const Login: React.FC<LoginProps> = ({ showRegisterLink = false }) => {
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
    <div className="container-fluid vh-100 p-0">
      <div className="row g-0 h-100">
        {/* Left Column - Login Form */}
        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center auth-left-column">
          <div className="w-100 px-3 px-md-5" style={{ maxWidth: '450px' }}>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <img
                  src={logo}
                  alt="Logo"
                  className="img-fluid d-block mx-auto mb-4"
                  style={{ maxWidth: '120px' }}
                />
                
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-semibold">Usuario</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ingrese su usuario"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingrese su contraseña"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">
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
                  <>
                    <div className="mt-3 text-center">
                      <p className="text-muted small mb-1">
                        ¿No puedes ingresar?{' '}
                        <Link to="#" className="text-primary text-decoration-none fw-semibold">
                          Recuperar contraseña
                        </Link>
                      </p>
                      <p className="text-muted small mb-0">
                        ¿Nuevo en TicMeal?{' '}
                        <Link to="/register" className="text-primary text-decoration-none fw-semibold">
                          ¡Regístrate!
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Promotional Content */}
        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center auth-right-column">
          <div className="w-100 px-3 px-md-5 pt-0 pb-5" style={{ maxWidth: '500px' }}>
            <div className="text-center text-lg-start">
              {/* <h2 className="fw-bold mb-3" style={{ color: '#FF6B35', fontSize: '2rem' }}>
                ¡Gestiona tu comedor de manera eficiente!
              </h2> */}
              {/* <p className="text-dark mb-4 fs-5">
                Sistema completo de gestión para comedores empresariales
              </p> */}
              <img
                src={loginImg}
                alt="Gestión de comedor"
                className="img-fluid d-block mx-auto mx-lg-0 mb-2"
                style={{ maxWidth: '350px' }}
              />
              <h3 className="fw-bold mb-3" style={{ color: '#FF6B35', fontSize: '2rem' }}>
                ¡Gestiona tu comedor de manera eficiente!
              </h3>
              
              <ul className="list-unstyled mb-4">
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                  <span className="text-dark">Gestiona todos tus turnos y tickets desde un solo lugar.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                  <span className="text-dark">Control total sobre el menú y disponibilidad de platos.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                  <span className="text-dark">Reportes y estadísticas en tiempo real.</span>
                </li>
              </ul>

              {/* <div className="d-flex align-items-center justify-content-center justify-content-lg-start">
                <i className="bi bi-share-fill me-2" style={{ fontSize: '1.2rem', color: '#FF6B35' }}></i>
                <span className="text-muted">Accede desde cualquier dispositivo</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
