import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  firsName: string;
  lastName: string;
  email: string;
  role: 'company_admin' | 'kitchen_admin' | 'diner' | string;
  isActive: boolean;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No autenticado');
        }

        const response = await fetch('http://localhost:3000/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al obtener los usuarios');
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const renderUsersByRole = (role: string, title: string) => {
    const filteredUsers = users.filter(user => user.role === role);

    if (filteredUsers.length === 0) {
      return null;
    }

    return (
      <div className="mb-5">
        <h3 className="mb-3">{title}</h3>
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th>Fecha de Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>{user.firsName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-pencil-square"></i> Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}><div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Usuarios</h1>
        <button className="btn btn-primary">
            <i className="bi bi-plus-circle me-2"></i>
            Añadir Usuario
        </button>
      </div>

      {renderUsersByRole('company_admin', 'Administradores de Empresa')}
      {renderUsersByRole('kitchen_admin', 'Administradores de Cocina')}
      {renderUsersByRole('diner', 'Comensales')}
    </div>
  );
};

export default UserManagement;