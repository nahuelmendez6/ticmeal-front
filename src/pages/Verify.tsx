import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Verify: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  if (!email) {
    // Redirect to register if no email is present
    navigate('/register');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/auth/verify-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      if (response.ok) {
        setSuccess('¡Verificación exitosa! Redirigiendo al inicio de sesión...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Código de verificación inválido.');
      }
    } catch (err) {
      setError('Ocurrió un error al verificar el código. Por favor, intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center">
      <div className="w-100" style={{ maxWidth: '450px' }}>
        <div className="card shadow-sm border-0">
          <div className="card-body p-4 p-md-5">
            <img
              src={logo}
              alt="Logo"
              className="img-fluid d-block mx-auto mb-3"
              style={{ maxWidth: '120px' }}
            />

            <div className="mb-4 text-center">
              <h4 className="mb-2 fw-bold">Verificar Cuenta</h4>
              <p className="text-muted small">
                Se ha enviado un código de verificación a <strong>{email}</strong>. Por favor, ingréselo a continuación.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="verificationCode" className="form-label fw-semibold">Código de Verificación</label>
                <input
                  type="text"
                  className="form-control"
                  id="verificationCode"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ingrese el código"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 mb-3" disabled={submitting}>
                {submitting ? 'Verificando...' : 'Verificar'}
              </button>
            </form>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
            {success && <div className="alert alert-success mt-3">{success}</div>}

            <div className="mt-3 text-center">
              <p className="text-muted small mb-0">
                ¿No recibiste el código? <Link to="/register">Intenta registrarte de nuevo</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;