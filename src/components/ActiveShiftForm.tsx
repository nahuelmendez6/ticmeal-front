import React, { useState, useEffect } from "react";
import {
  Coffee, Apple, Pizza, Beef, Salad, Soup, Utensils, Wine,
  Banana, Cookie, Croissant, CupSoda, CakeSlice, Beer, Donut, EggFried,
  GlassWater, Milk, IceCream, Drumstick, Ham, Hamburger, AlertTriangle
} from 'lucide-react';

// --- Icon Mapping ---
const iconMap: { [key: string]: React.ElementType } = { Coffee, Sandwich: Utensils, Apple, Pizza, Beef, Salad, Soup, Utensils, Wine, Banana, Cookie, Croissant, CupSoda, CakeSlice, Beer, Donut, Egg: EggFried, EggFried, GlassWater, Milk, IceCream, Drumstick, Ham, Burger: Hamburger, Hamburger };

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

// --- Icon Component ---
const MenuItemIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = iconMap[iconName] || AlertTriangle;
  return <Icon size={40} />;
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
  const itemsInCategory = menuItems.filter(item => item.category.name === categoryName);
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
  const behavior = getCategoryBehavior(item.category.name, allItems);
  const currentSelection = selectedItems.get(item.id) || 0;

  if (item.maxOrder !== null && currentSelection >= item.maxOrder) return true;

  if (behavior.type === 'exclusive') {
    for (const [selectedId] of selectedItems.entries()) {
      const existingItem = allItems.find(i => i.id === selectedId);
      if (existingItem && existingItem.category.name === item.category.name) {
        return true; // Ya hay un item de esta categoría exclusiva seleccionado
      }
    }
  } else if (behavior.type === 'quantity') {
    const currentCategoryQuantity = Array.from(selectedItems.entries())
      .filter(([id]) => allItems.find(i => i.id === id)?.category.name === item.category.name)
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- Efecto para Obtener Datos de la API ---
  useEffect(() => {
    const fetchActiveShift = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        const response = await fetch('http://localhost:3000/shifts/active-by-hour', {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        credentials: "include" // si usás cookies también
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data: Shift[] = await response.json();
        // El endpoint devuelve un array, tomamos el primer elemento
        setShift(data[0] || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error al cargar el turno.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveShift();
  }, []);

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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('PIN Ingresado:', pin);
    console.log('Items Seleccionados (ID -> Cantidad):', Object.fromEntries(selectedItems));
    alert('Pedido enviado. Revisa la consola para ver los datos.');
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
      <div className="d-flex justify-content-center align-items-center min-vh-100 text-center">
        <div>
          <i className="bi bi-calendar-x fs-1 text-muted"></i>
          <p className="mt-3 fs-5 text-muted">No hay turnos activos en este momento.</p>
        </div>
      </div>
    );
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

                {/* Botón de Envío */}
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={!pin || selectedItems.size === 0}
                >
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