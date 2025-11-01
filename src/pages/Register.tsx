import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/react.svg'; // Placeholder, replace with actual logo

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
    <div className="container">
      <div className="row justify-content-center min-vh-100 align-items-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body p-4">
              <img
                src={logo}
                alt="Logo"
                className="img-fluid d-block mx-auto mb-3"
                style={{ maxWidth: '120px' }}
              />

              <div className="mb-3 text-center">
                <h4 className="mb-2">Registro de Empresa</h4>
                <p className="text-muted small">
                  Cree una cuenta para su empresa
                </p>
              </div>

              <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                <div className="mb-3">
                  <label htmlFor="companyName" className="form-label">Nombre de la Empresa *</label>
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
                  <label htmlFor="adminEmail" className="form-label">Email *</label>
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
                  <label htmlFor="adminPassword" className="form-label">Contraseña *</label>
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
                  <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña *</label>
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

                <button type="submit" className="btn btn-primary w-100">
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
                <p className="text-muted">
                  ¿Ya tiene una cuenta?{' '}
                  <Link to="/login" className="text-primary">
                    Inicie sesión aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

