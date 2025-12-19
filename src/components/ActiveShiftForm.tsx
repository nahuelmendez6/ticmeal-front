import React, { useState, useEffect } from "react";
import {
  Coffee, Apple, Pizza, Beef, Salad, Soup, Utensils, Wine,
  Banana, Cookie, Croissant, CupSoda, CakeSlice, Beer, Donut, EggFried,
  GlassWater, Milk, IceCream, Drumstick, Ham, Hamburger, AlertTriangle, BottleWine, Sandwich,
  Leaf, Vegan, WheatOff, MilkOff, HeartPulse, FishOff, Baby
} from 'lucide-react';

// --- Icon Mapping ---
const iconMap: { [key: string]: React.ElementType } = { Coffee, Sandwich: Sandwich, Apple, Pizza, Beef, Salad, Soup, Utensils, Wine, Banana, Cookie, Croissant, CupSoda, CakeSlice, Beer, Donut, Egg: EggFried, EggFried, GlassWater, Milk, IceCream, Drumstick, Ham, Burger: Hamburger, Hamburger, BottleWine: BottleWine };

// --- 1. Definición de Tipos para los Datos de la API ---
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

// --- 1.1. Definición de Tipos para la Respuesta del Ticket ---
interface TicketUser {
  id: number;
  firstName: string;
  lastName:string;
}

interface TicketShift {
  id: number;
  name: string;
}

interface TicketMenuItem {
  id: number;
  name: string;
}

interface TicketObservation {
  id: number;
  name: string;
  iconName: string;
}

interface Ticket {
  id: number;
  status: string;
  date: string;
  time: string;
  user: TicketUser;
  shift: TicketShift;
  menuItems: TicketMenuItem[];
  observations: TicketObservation[];
  createdAt: string;
}



// --- Icon Component ---
const MenuItemIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = iconMap[iconName] || AlertTriangle;
  return <Icon size={40} />;
};

const observationIconMap: { [key: string]: React.ElementType } = {
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

const ObservationIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = observationIconMap[iconName] || AlertTriangle;
  return <Icon className="me-2" size={20} />;
};
// --- 3. Lógica de Negocio Dinámica ---
type CategoryBehavior = 
  | { type: 'exclusive'; limit: 1 }
  | { type: 'quantity'; limit: number }
  | { type: 'unlimited' };

/**
 * Determina el comportamiento de una categoría basándose en los `maxOrder` de sus items.
 * - Si TODOS los items tienen maxOrder=1, la categoría es 'exclusive' (solo un tipo de item).
 * - Si ALGÚN item tiene maxOrder > 1, la categoría es 'quantity' y su límite es el maxOrder más alto.
 * - Si no, es 'unlimited'.
 */
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

  // If the item has no category, no category-based rules apply.
  if (!item.category) {
    return false;
  }

  const behavior = getCategoryBehavior(item.category.name, allItems);

  if (behavior.type === 'exclusive') {
    for (const [selectedId] of selectedItems.entries()) {
      const existingItem = allItems.find(i => i.id === selectedId);
      if (existingItem?.category?.name === item.category.name) {
        return true; // Ya hay un item de esta categoría exclusiva seleccionado
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
// --- 2. Componente Principal del Formulario ---
const ActiveShiftForm: React.FC = () => {
  // --- Estados del Componente ---
  const [shift, setShift] = useState<Shift | null>(null);
  const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map());
  const [pin, setPin] = useState<string>('');
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';


  // --- Efecto para Obtener Datos de la API ---
  useEffect(() => {
    const fetchActiveShift = async () => {
      try {
        setLoading(true);

        // 1. Define el ID de tu empresa (puedes obtenerlo de una variable de entorno o config)
        const tenantId = 1; 

        // 2. PETICIÓN LIMPIA: Sin Authorization header y con el ID en la URL
        const response = await fetch(`${baseUrl}/shifts/active-by-hour/${tenantId}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        // Si tu API ahora devuelve un objeto directo del turno, quita el [0]
        setShift(Array.isArray(data) ? data[0] : data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error al cargar el turno.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveShift();
  }, [baseUrl]);

  // --- Manejadores de Eventos ---
  const handleAddItem = (item: MenuItem) => {
    setSelectedItems(prevSelectedItems => {
      const newSelectedItems = new Map(prevSelectedItems);
      const currentQuantity = newSelectedItems.get(item.id) || 0;
      
      if (isItemButtonDisabled(item, prevSelectedItems, shift?.menuItems || [])) {
        // Si el botón ya debería estar deshabilitado, no hacemos nada.
        // Esto previene añadir más allá del límite de categoría.
        return prevSelectedItems;
      }

      newSelectedItems.set(item.id, currentQuantity + 1);

      return newSelectedItems;
    });
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(prevSelectedItems => {
      const newSelectedItems = new Map(prevSelectedItems);
      const currentQuantity = newSelectedItems.get(itemId);
      if (currentQuantity && currentQuantity > 1) {
        newSelectedItems.set(itemId, currentQuantity - 1);
      } else {
        newSelectedItems.delete(itemId);
      }
      return newSelectedItems;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    // ID de la empresa (asegúrate que coincida con tu base de datos)
    const tenantId = 1; 

    // Construir el array de menuItemIds
    const menuItemIds: number[] = [];
    for (const [id, quantity] of selectedItems.entries()) {
      for (let i = 0; i < quantity; i++) {
        menuItemIds.push(id);
      }
    }

    const payload = {
      pin,
      menuItemIds,
    };

    try {
      // 1. URL pública con tenantId
      // 2. SIN el header "Authorization" para evitar el "Bearer null"
      const response = await fetch(`${baseUrl}/tickets/public/${tenantId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const newTicket: Ticket = await response.json();
      setCreatedTicket(newTicket);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el ticket.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };


  // --- Renderizado Condicional ---
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando turno...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="row justify-content-center min-vh-100 align-items-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="alert alert-danger text-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!shift) {
    return (
      <div className="container">
        <div className="row justify-content-center min-vh-100 align-items-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm text-center border-0">
              <div className="card-body p-5">
                <i className="bi bi-emoji-frown fs-1 text-warning"></i>
                <h2 className="h4 mt-3 mb-2">No hay turnos activos</h2>
                <p className="text-muted">
                  Por favor, vuelve a intentarlo más tarde o contacta al administrador si crees que es un error.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Componente para Mostrar el Ticket ---
const TicketView: React.FC<{ ticket: Ticket; onNewOrder: () => void, allMenuItems: MenuItem[], onUpdateTicket: (t: Ticket) => void }> = ({ ticket, onNewOrder, allMenuItems, onUpdateTicket }) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (action: 'pause' | 'cancel') => {
    setActionLoading(action);
    try {
      const response = await fetch(`${baseUrl}/tickets/${ticket.id}/${action}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const updatedTicket: Ticket = await response.json();
      onUpdateTicket(updatedTicket);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'No se pudo actualizar el ticket.');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badgeMap: { [key: string]: { text: string; className: string } } = {
      pending: { text: 'Pendiente', className: 'bg-warning text-dark' },
      approved: { text: 'Aprobado', className: 'bg-success' },
      rejected: { text: 'Rechazado', className: 'bg-danger' },
      delivered: { text: 'Entregado', className: 'bg-info' },
      cancelled: { text: 'Cancelado', className: 'bg-secondary' },
    };
    const badge = badgeMap[status] || { text: status, className: 'bg-light text-dark' };
    return <span className={`badge fs-6 ${badge.className}`}>{badge.text}</span>;
  };

  const formattedTicketId = `${ticket.shift.name.charAt(0).toUpperCase()}-${ticket.id}`;

  const fecha = new Date(ticket.date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Agrupar items para mostrar cantidades
  const groupedItems = ticket.menuItems.reduce((acc, item) => {
    const existing = acc.get(item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      const originalItem = allMenuItems.find(mi => mi.id === item.id);
      acc.set(item.id, {
        name: item.name,
        quantity: 1,
        iconName: originalItem?.iconName || 'Utensils',
      });
    }
    return acc;
  }, new Map<number, { name: string; quantity: number; iconName: string }>());

  return (
    <div className="container">
      <div className="row justify-content-center min-vh-100 align-items-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-lg">
            <div className="card-body p-4 p-md-5 ticket-success text-center">
              <h3 className="fw-bold mb-3 d-flex align-items-center justify-content-center text-success">
                <i className="bi bi-check-circle-fill me-2"></i>
                Ticket Generado
              </h3>

              <p className="h5 text-muted mb-3">#{formattedTicketId}</p>

              {getStatusBadge(ticket.status)}

              <div className="text-start mt-3">
                <p style={{ fontSize: '1.1rem' }}><strong>Nombre:</strong> {ticket.user.firstName} {ticket.user.lastName}</p>
                <p style={{ fontSize: '1.1rem' }}><strong>Turno:</strong> {ticket.shift.name}</p>
                <p style={{ fontSize: '1.1rem' }}><strong>Fecha:</strong> {fecha}</p>
                <p style={{ fontSize: '1.1rem' }}><strong>Hora:</strong> {ticket.time}</p>
              </div>

              {groupedItems.size > 0 && (
                <div className="mt-3 text-start">
                  <h6 className="text-secondary">Ítems seleccionados:</h6>
                  <ul className="list-group list-group-flush">
                    {Array.from(groupedItems.entries()).map(([id, item]) => (
                      <li key={id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                        <div className="d-flex align-items-center">
                          <MenuItemIcon iconName={item.iconName} />
                          <span className="ms-2">{item.name}</span>
                        </div>
                        <span className="badge bg-primary rounded-pill fs-6">
                          {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ticket.observations && ticket.observations.length > 0 && (
                <div className="mt-3 text-start">
                  <h6 className="text-secondary">Observaciones:</h6>
                  <ul className="list-group list-group-flush">
                    {ticket.observations.map((obs) => (
                      <li key={obs.id} className="list-group-item d-flex align-items-center px-0">
                        <ObservationIcon iconName={obs.iconName} />
                        <span>{obs.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="d-flex gap-2 mt-4">
                <button 
                  className="btn btn-warning flex-grow-1"
                  onClick={() => handleAction('pause')}
                  disabled={!!actionLoading || ['cancelled', 'delivered', 'rejected'].includes(ticket.status)}
                >
                  {actionLoading === 'pause' ? <span className="spinner-border spinner-border-sm me-2"/> : <i className="bi bi-pause-circle me-2"></i>}
                  Pausar
                </button>
                <button 
                  className="btn btn-danger flex-grow-1"
                  onClick={() => handleAction('cancel')}
                  disabled={!!actionLoading || ['cancelled', 'delivered', 'rejected'].includes(ticket.status)}
                >
                  {actionLoading === 'cancel' ? <span className="spinner-border spinner-border-sm me-2"/> : <i className="bi bi-x-circle me-2"></i>}
                  Cancelar
                </button>
              </div>

              <button className="btn btn-outline-primary mt-3 w-100" onClick={onNewOrder}>
                <i className="bi bi-plus-circle me-2"></i>
                Generar Nuevo Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  // --- Renderizado del Ticket Creado ---
  if (createdTicket) {
    return <TicketView ticket={createdTicket} allMenuItems={shift?.menuItems || []} onUpdateTicket={setCreatedTicket} onNewOrder={() => {
      setCreatedTicket(null);
      setSelectedItems(new Map());
      setPin('');
      setError(null);
    }} />;
  }
  // --- Renderizado del Formulario ---
  return (
    <div className="container">
      <div className="row justify-content-center min-vh-100 align-items-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-lg">
            <div className="card-body p-4 p-md-5">
              <header className="text-center mb-4">
                <h1 className="card-title h2">{shift.name}</h1>
                <p className="text-muted">Selecciona los productos que deseas</p>
              </header>

              <form onSubmit={handleSubmit} noValidate>
                {/* Input para el PIN */}
                <div className="mb-4">
                  <label htmlFor="pin" className="form-label fw-bold">PIN</label>
                  <input
                    type="password"
                    id="pin"
                    name="pin"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="form-control form-control-lg text-center"
                    placeholder="****"
                    pattern="\d{4}"
                    maxLength={4}
                    required
                    autoFocus
                  />
                  <div className="form-text text-center mt-2">
                    Ingresa tu PIN de 4 dígitos para confirmar.
                  </div>
                </div>

                {/* Grid de Items del Menú */}
                <div className="mb-4">
                  <label className="form-label fw-bold">Menú Disponible</label>
                  <div className="row g-3">
                    {shift.menuItems.map((item) => {
                      const quantity = selectedItems.get(item.id) || 0;
                      const isAddButtonDisabled = isItemButtonDisabled(item, selectedItems, shift.menuItems);

                      return (
                        <div key={item.id} className="col-6 col-sm-4">
                          <div className={`card h-100 text-center ${quantity > 0 ? 'border-primary' : ''}`}>
                            <div className="card-body d-flex flex-column justify-content-between p-2">
                              <div className="mb-2">
                                <MenuItemIcon iconName={item.iconName} />
                                <span className="d-block small fw-bold text-wrap mt-2" style={{ minHeight: '3em' }}>{item.name}</span>
                              </div>
                              {quantity === 0 ? (
                                <button type="button" onClick={() => handleAddItem(item)} className="btn btn-outline-primary btn-sm w-100" disabled={isAddButtonDisabled}>
                                  Agregar
                                </button>
                              ) : (
                                <div className="d-flex justify-content-center align-items-center">
                                  <button type="button" onClick={() => handleRemoveItem(item.id)} className="btn btn-secondary btn-sm">-</button>
                                  <span className="mx-2 fw-bold">{quantity}</span>
                                  <button type="button" onClick={() => handleAddItem(item)} className="btn btn-primary btn-sm" disabled={isAddButtonDisabled}>+</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alerta de error en el envío */}
                {error && !submitting && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <div>{error}</div>
                  </div>
                )}

                {/* Botón de Envío */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={!pin || pin.length < 4 || selectedItems.size === 0 || submitting}
                >
                  {submitting && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
                  <i className="bi bi-check-circle me-2"></i>
                  Confirmar Pedido ({Array.from(selectedItems.values()).reduce((acc, val) => acc + val, 0)})
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveShiftForm;