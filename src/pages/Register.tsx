import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png'; // Placeholder, replace with actual logo

const Register: React.FC = () => {
  const [companyName, setCompanyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { registerCompany } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (adminPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (adminPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const registerData = {
        company: {
          name: companyName,
        },
        admin: {
          email: adminEmail,
          password: adminPassword,
        },
      };

      const success = await registerCompany(registerData);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError('Error al registrar la empresa');
      }
    } catch (err) {
      setError('Error al registrar la empresa');
    }
  };

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row g-0 h-100">
        {/* Left Column - Registration Form */}
        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center auth-left-column">
          <div className="w-100 px-3 px-md-5" style={{ maxWidth: '450px' }}>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4 p-md-5">
                <img
                  src={logo}
                  alt="Logo"
                  className="img-fluid d-block mx-auto mb-3"
                  style={{ maxWidth: '120px' }}
                />

                <div className="mb-3 text-center">
                  <h4 className="mb-2 fw-bold">Registro de Empresa</h4>
                  <p className="text-muted small mb-0">
                    Cree una cuenta para su empresa
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  <div className="mb-3">
                    <label htmlFor="companyName" className="form-label fw-semibold">Nombre de la Empresa *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ej: ACME"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="adminEmail" className="form-label fw-semibold">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      id="adminEmail"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@empresa.com"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="adminPassword" className="form-label fw-semibold">Contraseña *</label>
                    <input
                      type="password"
                      className="form-control"
                      id="adminPassword"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">Confirmar Contraseña *</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme su contraseña"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    <i className="bi bi-person-plus me-2"></i>Registrar Empresa
                  </button>
                </form>

                {error && (
                  <div className="alert alert-danger mt-3" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success mt-3" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    Empresa registrada exitosamente. Redirigiendo...
                  </div>
                )}

                <div className="mt-3 text-center">
                  <p className="text-muted small mb-0">
                    ¿Ya tiene una cuenta?{' '}
                    <Link to="/login" className="text-primary text-decoration-none fw-semibold">
                      Inicie sesión aquí
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Promotional Content */}
        <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center auth-right-column">
          <div className="w-100 px-3 px-md-5 py-5" style={{ maxWidth: '500px' }}>
            <div className="text-center text-lg-start">
              <h2 className="fw-bold mb-3" style={{ color: '#FF6B35', fontSize: '2rem' }}>
                ¡Únete a TicMeal hoy!
              </h2>
              <p className="text-dark mb-4 fs-5">
                Comience a gestionar su comedor empresarial de forma profesional
              </p>
              
              <ul className="list-unstyled mb-4">
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                  <span className="text-dark">Registro rápido y sencillo. Empiece en minutos.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                  <span className="text-dark">Gestione usuarios, turnos y menús desde el primer día.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                  <span className="text-dark">Soporte dedicado para ayudarle a comenzar.</span>
                </li>
              </ul>

              <div className="d-flex align-items-center justify-content-center justify-content-lg-start">
                <i className="bi bi-shield-check-fill me-2" style={{ fontSize: '1.2rem', color: '#FF6B35' }}></i>
                <span className="text-muted">Plataforma segura y confiable</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
