import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  UserCog,
  ChefHat,
  Users,
  FilePenLine,
  Trash2,
  Leaf,
  Vegan,
  WheatOff,
  MilkOff,
  AlertTriangle,
  HeartPulse,
  Gauge,
  FishOff,
  Baby,
  CupSoda,
} from 'lucide-react';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'company_admin' | 'kitchen_admin' | 'diner' | string;
  isActive: boolean;
  createdAt: string;
  observationIds: [];
}

interface Observation {
  id: number;
  name: string;
  iconName: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  'WheatOff': WheatOff,
  'Leaf': Leaf,
  'Vegan': Vegan,
  'MilkOff': MilkOff,
  'AlertTriangle': AlertTriangle,
  'HeartPulse': HeartPulse,
  'Gauge': Gauge,
  'FishOff': FishOff,
  'Baby': Baby,
  'Blender': CupSoda, // Corregido: 'Blender' no existe, se usa 'CupSoda' en su lugar
};

const ObservationIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = iconMap[iconName] || AlertTriangle; // Icono por defecto si no se encuentra
  return <Icon className="me-2" size={18} />;
}

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  role: 'diner' | 'kitchen_admin';
  observationIds: number[];
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('company_admin');

  const [showModal, setShowModal] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loadingObservations, setLoadingObservations] = useState(false);

  const [newUser, setNewUser] = useState<NewUser>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'diner',
    observationIds: [],
  });
  const [submitting, setSubmitting] = useState(false);

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
          const errorData = await response.json().catch(() => ({ message: 'Error al obtener los usuarios' }));
          throw new Error(errorData.message || 'Error al obtener los usuarios');
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

  useEffect(() => {
    const fetchObservations = async () => {
      if (showModal) {
        setLoadingObservations(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('No autenticado');
          }
          const response = await fetch('http://localhost:3000/observations', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Error al obtener las observaciones');
          }
          const data: Observation[] = await response.json();
          setObservations(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
        } finally {
          setLoadingObservations(false);
        }
      }
    };

    fetchObservations();
  }, [showModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleObservationChange = (observationId: number) => {
    const newObservationIds = newUser.observationIds.includes(observationId) ? newUser.observationIds.filter(id => id !== observationId) : [...newUser.observationIds, observationId];
    setNewUser(prev => ({ ...prev, observationIds: newObservationIds }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const endpoint = newUser.role === 'diner'
      ? 'http://localhost:3000/auth/register-diner'
      : 'http://localhost:3000/auth/register-kitchen-admin';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          observationsIds: newUser.observationIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar el usuario');
      }

      // Re-fetch users to update the list
      // For simplicity, we'll just reload the page. A better approach would be to refetch.
      window.location.reload();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };

  const renderUsersTable = (role: string) => {
    const filteredUsers = users.filter(user => user.role === role);

    return (
        <div className="card">
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
                      <td>{user.firstName} {user.lastName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <>
                            <button className="btn btn-sm btn-outline-primary me-2" title="Editar" style={{ border: 'none' }}>
                                <FilePenLine size={18} />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" title="Eliminar" style={{ border: 'none' }}>
                                <Trash2 size={18} />
                            </button>
                        </>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <PlusCircle className="me-2" size={20}/>
            Añadir Usuario
        </button>
      </div>

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button className={`nav-link d-flex align-items-center ${activeTab === 'company_admin' ? 'active' : ''}`} onClick={() => setActiveTab('company_admin')}>
            <UserCog className="me-2" size={18}/>Administradores de Empresa
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link d-flex align-items-center ${activeTab === 'kitchen_admin' ? 'active' : ''}`} onClick={() => setActiveTab('kitchen_admin')}>
            <ChefHat className="me-2" size={18}/>Administradores de Cocina
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link d-flex align-items-center ${activeTab === 'diner' ? 'active' : ''}`} onClick={() => setActiveTab('diner')}>
            <Users className="me-2" size={18}/>Comensales
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'company_admin' && renderUsersTable('company_admin')}
        {activeTab === 'kitchen_admin' && renderUsersTable('kitchen_admin')}
        {activeTab === 'diner' && renderUsersTable('diner')}
      </div>

      {/* Add User Modal */}
      <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex={-1} style={{ backgroundColor: showModal ? 'rgba(0,0,0,0.5)' : 'transparent' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Añadir Nuevo Usuario</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label htmlFor="firstName" className="form-label">Nombre</label>
                  <input type="text" className="form-control" id="firstName" name="firstName" value={newUser.firstName} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="lastName" className="form-label">Apellido</label>
                  <input type="text" className="form-control" id="lastName" name="lastName" value={newUser.lastName} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input type="email" className="form-control" id="email" name="email" value={newUser.email} onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="role" className="form-label">Rol</label>
                  <select className="form-select" id="role" name="role" value={newUser.role} onChange={handleInputChange}>
                    <option value="diner">Comensal</option>
                    <option value="kitchen_admin">Administrador de Cocina</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Observaciones (Opcional)</label>
                  {loadingObservations ? (
                    <div className="text-center"><div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Cargando...</span></div></div>
                  ) : (
                    <div className="row">
                      {observations.map(obs => (
                        <div className="col-md-6" key={obs.id}>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              value={obs.id} 
                              id={`obs-${obs.id}`} 
                              onChange={() => handleObservationChange(obs.id)} />
                            <label className="form-check-label d-flex align-items-center" htmlFor={`obs-${obs.id}`}><ObservationIcon iconName={obs.iconName} />{obs.name}</label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Registrando...
                    </>
                  ) : 'Registrar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default UserManagement;