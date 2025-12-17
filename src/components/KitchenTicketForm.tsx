import React, { useState, useEffect, useCallback } from "react";
import {
  Coffee, Apple, Pizza, Beef, Salad, Soup, Utensils, Wine,
  Banana, Cookie, Croissant, CupSoda, CakeSlice, Beer, Donut, EggFried,
  GlassWater, Milk, IceCream, Drumstick, Ham, Hamburger, AlertTriangle, BottleWine, Sandwich,
  Search, User as UserIcon, X
} from 'lucide-react';

// --- Icon Mapping (Reutilizado) ---
const iconMap: { [key: string]: React.ElementType } = { Coffee, Sandwich: Sandwich, Apple, Pizza, Beef, Salad, Soup, Utensils, Wine, Banana, Cookie, Croissant, CupSoda, CakeSlice, Beer, Donut, Egg: EggFried, EggFried, GlassWater, Milk, IceCream, Drumstick, Ham, Burger: Hamburger, Hamburger, BottleWine: BottleWine };

// --- Interfaces ---
interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface MenuItem {
  id: number;
  name: string;
  stock: number;
  iconName: string;
  cost: string;
  category: Category;
  isActive: boolean;
  maxOrder: number | null;
}

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  menuActive: boolean;
  menuItems: MenuItem[];
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface Ticket {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  user?: User;
  menuItems: MenuItem[];
}

// --- Componente de Icono ---
const MenuItemIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = iconMap[iconName] || AlertTriangle;
  return <Icon size={40} />;
};

// --- Lógica de Negocio (Reutilizada) ---
type CategoryBehavior = 
  | { type: 'exclusive'; limit: 1 }
  | { type: 'quantity'; limit: number }
  | { type: 'unlimited' };

const getCategoryBehavior = (categoryName: string, menuItems: MenuItem[]): CategoryBehavior => {
  const itemsInCategory = menuItems.filter(item => item.category && item.category.name === categoryName);
  if (itemsInCategory.length === 0) return { type: 'unlimited' };

  const allHaveMaxOrderOne = itemsInCategory.every(item => item.maxOrder === 1);
  if (allHaveMaxOrderOne) {
    return { type: 'exclusive', limit: 1 };
  }

  const maxOrderInCategory = itemsInCategory.reduce((max, item) => {
    if (item.maxOrder === null) return Infinity;
    return Math.max(max, item.maxOrder);
  }, 0);

  if (maxOrderInCategory > 1) {
    return { type: 'quantity', limit: maxOrderInCategory };
  }

  return { type: 'unlimited' };
};

const isItemButtonDisabled = (item: MenuItem, selectedItems: Map<number, number>, allItems: MenuItem[]): boolean => {
  const currentSelection = selectedItems.get(item.id) || 0;
  if (item.maxOrder !== null && currentSelection >= item.maxOrder) return true;
  if (!item.category) return false;

  const behavior = getCategoryBehavior(item.category.name, allItems);

  if (behavior.type === 'exclusive') {
    for (const [selectedId] of selectedItems.entries()) {
      const existingItem = allItems.find(i => i.id === selectedId);
      if (existingItem?.category?.name === item.category.name) {
        return true;
      }
    }
  } else if (behavior.type === 'quantity') {
    const currentCategoryQuantity = Array.from(selectedItems.entries())
      .filter(([id]) => allItems.find(i => i.id === id)?.category?.name === item.category.name)
      .reduce((sum, [, qty]) => sum + qty, 0);
    if (currentCategoryQuantity >= behavior.limit) return true;
  }
  return false;
};

const KitchenTicketForm: React.FC = () => {
  const [shift, setShift] = useState<Shift | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`${baseUrl}/users`, {
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
  }, [baseUrl]);

  const fetchTickets = useCallback(async () => {
    try {
        setTicketsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No autenticado. Por favor, inicie sesión.");
        }

        const response = await fetch(`${baseUrl}/tickets`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Error: ${response.status}`);
        }

        const data: Ticket[] = await response.json();
        setTickets(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); // Ordenar por más reciente
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'No se pudo cargar la lista de tickets.');
    } finally {
        setTicketsLoading(false);
    }
  }, [baseUrl]);

  // Cargar turno activo y usuarios
  useEffect(() => {
    const fetchShift = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        };

        const shiftResponse = await fetch(`${baseUrl}/shifts/active-by-hour`, { headers });
        if (!shiftResponse.ok) throw new Error('Error al cargar el turno activo.');
        const shiftData: Shift[] = await shiftResponse.json();
        setShift(shiftData[0] || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error al cargar los datos.');
        console.error(err);
      }
    };

    const init = async () => {
      await fetchShift();
      await fetchUsers();
    };

    init();
  }, [fetchUsers, baseUrl]);

  // Cargar tickets
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Filtrar usuarios
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      (user.firstName?.toLowerCase() || '').includes(query) || 
      (user.lastName?.toLowerCase() || '').includes(query) ||
      (user.email?.toLowerCase() || '').includes(query)
    );
    setFilteredUsers(filtered.slice(0, 5)); // Limitar a 5 resultados
  }, [searchQuery, users]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSearchQuery('');
    setFilteredUsers([]);
  };

  const handleAddItem = (item: MenuItem) => {
    setSelectedItems(prev => {
      const newSelectedItems = new Map(prev);
      const currentQuantity = newSelectedItems.get(item.id) || 0;
      if (isItemButtonDisabled(item, prev, shift?.menuItems || [])) return prev;
      newSelectedItems.set(item.id, currentQuantity + 1);
      return newSelectedItems;
    });
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(prev => {
      const newSelectedItems = new Map(prev);
      const currentQuantity = newSelectedItems.get(itemId);
      if (currentQuantity && currentQuantity > 1) {
        newSelectedItems.set(itemId, currentQuantity - 1);
      } else {
        newSelectedItems.delete(itemId);
      }
      return newSelectedItems;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || selectedItems.size === 0) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const menuItemIds: number[] = [];
    selectedItems.forEach((quantity, id) => {
      for (let i = 0; i < quantity; i++) menuItemIds.push(id);
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/tickets/manual`, {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id, // Enviamos userId en lugar de PIN
          menuItemIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el ticket.');
      }

      const ticket = await response.json();

      // Marcar como usado (entregado) inmediatamente para registrar movimientos de stock
    //   const deliverResponse = await fetch(`${baseUrl}/tickets/${ticket.id}/deliver`, {
    //     method: 'PATCH',
    //     headers: {
    //       "Authorization": `Bearer ${token}`,
    //       "Content-Type": "application/json",
    //     },
    //   });

    //   if (!deliverResponse.ok) console.warn('No se pudo marcar el ticket como entregado automáticamente.');

      setSuccessMessage(`Ticket creado y marcado como entregado para ${selectedUser.firstName} ${selectedUser.lastName}`);
      setSelectedItems(new Map());
      setSelectedUser(null);
      setSearchQuery('');
      fetchTickets(); // Recargar la lista de tickets
      
      // Auto-ocultar mensaje de éxito
      setTimeout(() => setSuccessMessage(null), 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="alert alert-warning text-center m-4">
        <i className="bi bi-exclamation-triangle me-2"></i>
        No hay turnos activos en este momento.
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3">
          <h4 className="mb-0 text-primary d-flex align-items-center">
            <i className="bi bi-plus-square me-2"></i>
            Crear Ticket Manual
          </h4>
        </div>
        <div className="card-body p-4">
          
          {/* Mensajes de Estado */}
          {error && <div className="alert alert-danger mb-4">{error}</div>}
          {successMessage && <div className="alert alert-success mb-4"><i className="bi bi-check-circle me-2"></i>{successMessage}</div>}

          <div className="row g-4">
            {/* Columna Izquierda: Selección de Usuario */}
            <div className="col-md-4 border-end">
              <h5 className="mb-3">1. Seleccionar Usuario</h5>
              
              {!selectedUser ? (
                <div className="position-relative">
                  <div className="input-group mb-2">
                    <span className="input-group-text bg-light"><Search size={18} /></span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Buscar por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {filteredUsers.length > 0 && (
                    <div className="list-group position-absolute w-100 shadow-sm" style={{ zIndex: 1000 }}>
                      {filteredUsers.map(user => (
                        <button
                          key={user.id}
                          type="button"
                          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                          onClick={() => handleSelectUser(user)}
                        >
                          <div>
                            <div className="fw-bold">{user.firstName} {user.lastName}</div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                          <UserIcon size={16} className="text-secondary" />
                        </button>
                      ))}
                    </div>
                  )}
                  {searchQuery && filteredUsers.length === 0 && (
                    <div className="text-muted small ms-2">No se encontraron usuarios.</div>
                  )}
                </div>
              ) : (
                <div className="card bg-light border-primary mb-3">
                  <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title mb-0 text-primary">{selectedUser.firstName} {selectedUser.lastName}</h6>
                      <small className="text-muted">{selectedUser.email}</small>
                    </div>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => setSelectedUser(null)}>
                      <X size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Columna Derecha: Selección de Menú */}
            <div className="col-md-8">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">2. Seleccionar Menú ({shift.name})</h5>
                <span className="badge bg-secondary">{Array.from(selectedItems.values()).reduce((a, b) => a + b, 0)} ítems</span>
              </div>

              <div className="row g-3 mb-4">
                {shift.menuItems.map((item) => {
                  const quantity = selectedItems.get(item.id) || 0;
                  const isAddButtonDisabled = isItemButtonDisabled(item, selectedItems, shift.menuItems);

                  return (
                    <div key={item.id} className="col-6 col-lg-4">
                      <div className={`card h-100 text-center ${quantity > 0 ? 'border-primary bg-primary-subtle' : ''}`}>
                        <div className="card-body p-2 d-flex flex-column justify-content-between">
                          <div className="mb-2">
                            <MenuItemIcon iconName={item.iconName} />
                            <div className="small fw-bold mt-1 text-truncate" title={item.name}>{item.name}</div>
                          </div>
                          {quantity === 0 ? (
                            <button 
                              type="button" 
                              onClick={() => handleAddItem(item)} 
                              className="btn btn-outline-primary btn-sm w-100" 
                              disabled={isAddButtonDisabled}
                            >
                              Agregar
                            </button>
                          ) : (
                            <div className="d-flex justify-content-center align-items-center gap-2">
                              <button type="button" onClick={() => handleRemoveItem(item.id)} className="btn btn-secondary btn-sm py-0 px-2">-</button>
                              <span className="fw-bold">{quantity}</span>
                              <button type="button" onClick={() => handleAddItem(item)} className="btn btn-primary btn-sm py-0 px-2" disabled={isAddButtonDisabled}>+</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="d-grid">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmit}
                  disabled={!selectedUser || selectedItems.size === 0 || submitting}
                >
                  {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check2-circle me-2"></i>}
                  Confirmar Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Tickets Generados */}
      <div className="card shadow-sm border-0 mt-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 text-secondary">
            <i className="bi bi-list-check me-2"></i>
            Tickets Recientes
          </h5>
        </div>
        <div className="card-body p-0">
          {ticketsLoading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-secondary" role="status"><span className="visually-hidden">Cargando...</span></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-4 text-muted">No hay tickets registrados recientemente.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-4">ID</th>
                    <th scope="col">Usuario</th>
                    <th scope="col">Items</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => {
                    const ticketUser = ticket.user || users.find(u => u.id === ticket.userId);
                    const groupedItems = (ticket.menuItems || []).reduce((acc, item) => {
                      acc[item.name] = (acc[item.name] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>);

                    return (
                      <tr key={ticket.id}>
                        <td className="ps-4 fw-bold">#{ticket.id}</td>
                        <td>
                          {ticketUser ? (
                            <div>
                              <div className="fw-bold">{ticketUser.firstName} {ticketUser.lastName}</div>
                              <small className="text-muted">{ticketUser.email}</small>
                            </div>
                          ) : <span className="text-muted">Usuario desconocido</span>}
                        </td>
                        <td>
                          {Object.keys(groupedItems).length > 0 ? (
                            <ul className="list-unstyled mb-0 small">
                              {Object.entries(groupedItems).map(([name, quantity]) => (
                                <li key={name} className="d-flex justify-content-between align-items-center">
                                  <span>{name}</span>
                                  <span className="badge bg-primary rounded-pill ms-2">{quantity}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-muted small">Sin items</span>
                          )}
                        </td>
                        <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${ticket.status === 'DELIVERED' ? 'bg-success' : ticket.status === 'PENDING' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {ticket.status === 'DELIVERED' ? 'Entregado' : ticket.status === 'PENDING' ? 'Pendiente' : ticket.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KitchenTicketForm;