import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BackofficeUser {
  id: number;
  companyId: number;
  username: string | null;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const BackofficeUserManagement: React.FC = () => {
  const [users, setUsers] = useState<BackofficeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('backoffice_token');
      
      // Si no hay token, redirigir al login de admin
      if (!token) {
        navigate('/admin/login');
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/backoffice/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (response.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('backoffice_token');
            navigate('/admin/login');
            return;
        }

        if (!response.ok) {
          throw new Error('Error al obtener los usuarios');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleToggleStatus = async (userId: number, newStatus: boolean) => {
    const token = localStorage.getItem('backoffice_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const action = newStatus ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Estás seguro de que quieres ${action} al usuario con ID ${userId}?`)) {
      return;
    }

    setUpdatingUserId(userId);
    setError(null);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/backoffice/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error al ${action} el usuario.`);
      }

      setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, isActive: newStatus } : user));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Ocurrió un error desconocido al ${action} el usuario.`);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('backoffice_token');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0 text-dark">Gestión de Usuarios (Backoffice)</h2>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">ID</th>
                  <th>Usuario / Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha Registro</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="ps-4 fw-bold">#{user.id}</td>
                    <td>
                      <div className="fw-medium text-dark">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.username || <span className="text-muted fst-italic">Sin nombre</span>}
                      </div>
                      {user.username && (user.firstName || user.lastName) && (
                        <div className="small text-muted">{user.username}</div>
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.isActive ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          Activo
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="text-center">
                      {user.isActive ? (
                        <button
                          className="btn btn-sm btn-outline-warning"
                          onClick={() => handleToggleStatus(user.id, false)}
                          disabled={updatingUserId === user.id}
                          title="Desactivar usuario"
                        >
                          {updatingUserId === user.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-person-x"></i>
                          )}
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => handleToggleStatus(user.id, true)}
                          disabled={updatingUserId === user.id}
                          title="Activar usuario"
                        >
                          {updatingUserId === user.id ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                          ) : (
                            <i className="bi bi-person-check"></i>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !error && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackofficeUserManagement;