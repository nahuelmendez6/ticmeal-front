import React, { useState, useEffect, useCallback } from 'react';
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
  FishOff,
  Baby,
  CupSoda,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Interfaces
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'company_admin' | 'kitchen_admin' | 'diner' | string;
  isActive: boolean;
  createdAt: string;
  observations: Observation[];
}

interface Observation {
  id: number;
  name: string;
  iconName: string;
}

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  role: 'diner' | 'kitchen_admin';
  observationsIds: number[];
}

// Icon Mapping
const iconMap: { [key: string]: React.ElementType } = {
  'WheatOff': WheatOff,
  'Leaf': Leaf,
  'Vegan': Vegan,
  'MilkOff': MilkOff,
  'AlertTriangle': AlertTriangle,
  'HeartPulse': HeartPulse,
  'FishOff': FishOff,
  'Baby': Baby,
  'Blender': CupSoda,
};

// ObservationIcon Component
const ObservationIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = iconMap[iconName] || AlertTriangle;
  return <Icon className="me-2" size={18} />;
};

// UserManagement Component
const UserManagement: React.FC = () => {
  // State variables
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('company_admin');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loadingObservations, setLoadingObservations] = useState(false);
  const [emailVerification, setEmailVerification] = useState('');
  const [observationsOpen, setObservationsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'diner',
    observationsIds: [],
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');

      const response = await fetch('http://localhost:3000/users', {
        headers: { 'Authorization': `Bearer ${token}` },
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
  }, []);

  // Data fetching hooks
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchObservations = async () => {
      if (showModal) {
        setLoadingObservations(true);
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No autenticado');

          const response = await fetch('http://localhost:3000/observations', {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (!response.ok) throw new Error('Error al obtener las observaciones');
          
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

  // Modal and Form handlers
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'diner',
      observationsIds: [],
    });
    setEmailVerification('');
    setObservationsOpen(false);
    setError(null);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setNewUser({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      role: user.role as 'diner' | 'kitchen_admin',
      observationsIds: user.observations ? user.observations.map(obs => obs.id) : [],
    });
    setEmailVerification(user.email);
    setShowModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleObservationChange = (observationId: number) => {
    setNewUser(prev => ({
      ...prev,
      observationsIds: prev.observationsIds.includes(observationId)
        ? prev.observationsIds.filter(id => id !== observationId)
        : [...prev.observationsIds, observationId],
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.email !== emailVerification) {
      setError('Los correos electrónicos no coinciden.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const isEditing = editingUser !== null;
    const endpoint = isEditing
      ? `http://localhost:3000/users/${editingUser.id}`
      : (newUser.role === 'diner'
        ? 'http://localhost:3000/auth/register-diner'
        : 'http://localhost:3000/auth/register-kitchen-admin');
    
    const method = isEditing ? 'PATCH' : 'POST';

    let payload: any = {};
    if (isEditing) {
      if (newUser.firstName !== editingUser.firstName) payload.firstName = newUser.firstName;
      if (newUser.lastName !== editingUser.lastName) payload.lastName = newUser.lastName;
      if (newUser.email !== editingUser.email) payload.email = newUser.email;
      
      const oldObservationIds = new Set(editingUser.observations.map(o => o.id));
      const newObservationIds = new Set(newUser.observationsIds);
      if (oldObservationIds.size !== newObservationIds.size || ![...oldObservationIds].every(id => newObservationIds.has(id))) {
        payload.observationsIds = newUser.observationsIds;
      }
    } else {
      payload = { ...newUser, observationsIds: newUser.observationsIds };
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error al ${isEditing ? 'actualizar' : 'registrar'} el usuario` }));
        throw new Error(errorData.message);
      }

      handleCloseModal();
      await fetchUsers(); // Re-fetch users to update the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
    } finally {
      setSubmitting(false);
    }
  };

  // Render functions
  const renderUsersTable = (role: string) => {
    const filteredUsers = users.filter(user => user.role === role);

    return (
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : (
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
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
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
                          <button className="btn btn-sm btn-outline-primary me-2" title="Editar" style={{ border: 'none' }} onClick={() => handleEditClick(user)}>
                            <FilePenLine size={18} />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" title="Eliminar" style={{ border: 'none' }}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted p-4">No hay usuarios para mostrar en esta categoría.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Early return for initial loading error
  if (error && users.length === 0) {
    return <div className="alert alert-danger mt-4">Error: {error}</div>
  }

  // Filter unique observations for the modal
  const uniqueObservations = observations.filter((obs, index, self) =>
    index === self.findIndex((o) => o.id === obs.id)
  );

  // Calculate user counts per role
  const companyAdminsCount = users.filter(user => user.role === 'company_admin').length;
  const kitchenAdminsCount = users.filter(user => user.role === 'kitchen_admin').length;
  const dinersCount = users.filter(user => user.role === 'diner').length;


  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Usuarios</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusCircle className="me-2" size={20} />
          Añadir Usuario
        </button>
      </div>

      {/* User Count Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-subtitle mb-2 text-muted">Administradores de Empresa</h6>
                <h2 className="card-title mb-0">{companyAdminsCount}</h2>
              </div>
              <UserCog className="text-primary" size={40} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-subtitle mb-2 text-muted">Administradores de Cocina</h6>
                <h2 className="card-title mb-0">{kitchenAdminsCount}</h2>
              </div>
              <ChefHat className="text-success" size={40} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-subtitle mb-2 text-muted">Comensales</h6>
                <h2 className="card-title mb-0">{dinersCount}</h2>
              </div>
              <Users className="text-info" size={40} />
            </div>
          </div>
        </div>
      </div>


      <ul className="nav nav-underline mb-3">
        <li className="nav-item">
          <button className={`nav-link d-flex align-items-center ${activeTab === 'company_admin' ? 'active' : ''}`} onClick={() => setActiveTab('company_admin')}>
            <UserCog className="me-2" size={18} />Administradores de Empresa
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link d-flex align-items-center ${activeTab === 'kitchen_admin' ? 'active' : ''}`} onClick={() => setActiveTab('kitchen_admin')}>
            <ChefHat className="me-2" size={18} />Administradores de Cocina
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link d-flex align-items-center ${activeTab === 'diner' ? 'active' : ''}`} onClick={() => setActiveTab('diner')}>
            <Users className="me-2" size={18} />Comensales
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === 'company_admin' && renderUsersTable('company_admin')}
        {activeTab === 'kitchen_admin' && renderUsersTable('kitchen_admin')}
        {activeTab === 'diner' && renderUsersTable('diner')}
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleFormSubmit}>
                  <div className="modal-body">
                    {error && !submitting && <div className="alert alert-danger">{error}</div>}
                    <div className="row g-2">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="firstName" className="form-label">Nombre</label>
                        <input type="text" className="form-control form-control-sm" id="firstName" name="firstName" value={newUser.firstName} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="lastName" className="form-label">Apellido</label>
                        <input type="text" className="form-control form-control-sm" id="lastName" name="lastName" value={newUser.lastName} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control form-control-sm" id="email" name="email" value={newUser.email} onChange={handleInputChange} required />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="emailVerification" className="form-label">Verificar Email</label>
                        <input
                          type="email"
                          className={`form-control form-control-sm ${newUser.email !== emailVerification && emailVerification ? 'is-invalid' : ''}`}
                          id="emailVerification"
                          name="emailVerification"
                          value={emailVerification}
                          onChange={(e) => setEmailVerification(e.target.value)}
                          required={!!newUser.email}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label htmlFor="role" className="form-label">Rol</label>
                        <select className="form-select form-select-sm" id="role" name="role" value={newUser.role} onChange={handleInputChange} disabled={!!editingUser}>
                          <option value="diner">Comensal</option>
                          <option value="kitchen_admin">Administrador de Cocina</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-3">
                      <button className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center" type="button" onClick={() => setObservationsOpen(!observationsOpen)}>
                        Observaciones (Opcional)
                        {observationsOpen ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      <div className={`collapse ${observationsOpen ? 'show' : ''}`}>
                        <div className="card card-body">
                          {loadingObservations ? (
                            <div className="text-center">
                              <div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Cargando...</span></div>
                            </div>
                          ) : (
                            <div className="row" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                              {uniqueObservations.map(obs => (
                                <div className="col-md-6" key={obs.id}>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      value={obs.id}
                                      id={`obs-${obs.id}`}
                                      checked={newUser.observationsIds.includes(obs.id)}
                                      onChange={() => handleObservationChange(obs.id)}
                                    />
                                    <label className="form-check-label d-flex align-items-center" htmlFor={`obs-${obs.id}`}>
                                      <ObservationIcon iconName={obs.iconName} />{obs.name}
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {editingUser ? 'Guardando...' : 'Registrando...'}
                        </>
                      ) : (editingUser ? 'Guardar Cambios' : 'Registrar Usuario')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
