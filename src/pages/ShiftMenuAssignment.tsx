import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import {
  Plus, Coffee, Sandwich, Apple, Pizza, Trash2, FilePenLine, Beef, Hamburger,
  IceCreamBowl, Salad, Soup, Utensils, BottleWine, Banana, Cookie, Croissant,
  Dessert, Drumstick, EggFried, Ham, IceCreamCone, CupSoda, CakeSlice, Beer,
  Torus, Donut, Egg, GlassWater, Milk,
} from 'lucide-react';

const ItemTypes = {
  MENU_ITEM: 'menu_item',
};

const iconMap: { [key: string]: React.ElementType } = {
  Plus, Coffee, Sandwich, Apple, Pizza, Trash2, FilePenLine, Beef, Hamburger, IceCreamBowl, Salad, Soup, Utensils, BottleWine, Banana, Cookie, Croissant, Dessert, Drumstick, EggFried, Ham, IceCreamCone, CupSoda, CakeSlice, Beer, Torus, Donut, Egg, GlassWater, Milk,
  default: Utensils,
};

// Componente de ícono actualizado para aceptar tamaño y clases personalizadas
const IconComponent: React.FC<{ iconName: string | null; size?: number; className?: string }> = ({ iconName, size = 18, className = "me-2" }) => {
  const Icon = iconName ? (iconMap[iconName] || iconMap.default) : iconMap.default;
  return <Icon size={size} className={className} />;
};

interface MenuItem {
  id: number;
  name: string;
  category: { id: number; name: string } | null;
  iconName: string | null;
  isActive: boolean;
  type: 'SIMPLE' | 'COMPUESTO';
  isProduced: boolean | null;
}

interface Shift {
  id: number;
  name: string;
  menuItems: MenuItem[];
}

interface DraggableMenuItemProps {
  item: MenuItem;
}

// --- DraggableMenuItem MODIFICADO PARA SER UNA TARJETA EN LA GRILLA ---
const DraggableMenuItem: React.FC<DraggableMenuItemProps> = ({ item }) => {
  const canDrag = item.type !== 'COMPUESTO' || item.isProduced === true;
  const isDisabled = !canDrag;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MENU_ITEM,
    item: { ...item },
    canDrag: canDrag,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.4 : 1,
    cursor: isDisabled ? 'not-allowed' : 'move',
    minHeight: '90px',
  };

  const cardClasses = `card h-100 d-flex flex-column justify-content-center align-items-center shadow-sm ${isDisabled ? 'bg-light text-muted' : 'bg-white'}`;

  return (
    <div className="col-6 col-sm-4 col-md-3 mb-3">
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className={cardClasses}
        style={style}
        title={item.name}
      >
        <div className="card-body p-2 text-center">
          <IconComponent iconName={item.iconName} size={32} className="d-block mx-auto mb-2" />
          <p className="card-text small text-truncate mb-0" style={{ fontSize: '0.8rem' }}>
            {item.name}
          </p>
          {isDisabled && (
            <span
              className="badge bg-dark position-absolute top-0 start-100 translate-middle p-1"
              title="No Producido"
            >
              NP
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


interface ShiftDashboardProps {
  shifts: Shift[];
  activeShiftId: number | null;
  setActiveShiftId: (id: number) => void;
  groupedMenuItems: { [key: string]: MenuItem[] };
  assignedItems: { [key: number]: MenuItem[] };
  handleDrop: (item: MenuItem) => void;
  handleRemove: (itemId: number) => void;
}

// --- ShiftDashboard MODIFICADO PARA USAR LA GRILLA ---
const ShiftDashboard: React.FC<ShiftDashboardProps> = ({
  shifts,
  activeShiftId,
  setActiveShiftId,
  groupedMenuItems,
  assignedItems,
  handleDrop,
  handleRemove,
}) => {
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.MENU_ITEM,
    drop: (item: MenuItem) => {
      handleDrop(item);
    },
  }), [handleDrop]);

  return (
    <>
      <ul className="nav nav-underline mb-3">
        {shifts.map(shift => (
          <li className="nav-item" key={shift.id}>
            <button className={`nav-link ${activeShiftId === shift.id ? 'active' : ''}`} onClick={() => setActiveShiftId(shift.id)}>
              {shift.name}
            </button>
          </li>
        ))}
      </ul>

      <div className="row">
        <div className="col-md-7">
          <h5>Ítems Disponibles</h5>
          {Object.keys(groupedMenuItems).length > 0 ? (
            Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category} className="mb-3">
                <h6>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                {/* Contenedor de la grilla */}
                <div className="row g-2">
                  {items.map(item => (
                    <DraggableMenuItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted p-5 card bg-light" style={{ minHeight: '200px' }}>
              <p>No hay más ítems para asignar a este turno.</p>
            </div>
          )}
        </div>

        <div className="col-md-5">
          <div ref={drop as unknown as React.Ref<HTMLDivElement>} className="card bg-light sticky-top" style={{ top: '20px', minHeight: '400px' }}>
            <div className="card-header">
              Menú del Turno: <strong>{shifts.find(s => s.id === activeShiftId)?.name}</strong>
            </div>
            <div className="card-body">
              {activeShiftId && assignedItems[activeShiftId]?.length > 0 ? (
                <ul className="list-group">
                  {assignedItems[activeShiftId].map(item => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>
                        <IconComponent iconName={item.iconName} />
                        {item.name}
                      </span>
                      <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleRemove(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="d-flex align-items-center justify-content-center text-center text-muted p-5" style={{ minHeight: '300px' }}>
                  <span>Arrastra ítems aquí para asignarlos a este turno.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


const ShiftMenuAssignment: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [assignedItems, setAssignedItems] = useState<{ [key: number]: MenuItem[] }>({});
  const [activeShiftId, setActiveShiftId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchShifts = useCallback(async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseUrl}/shifts/menu-active`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al cargar los turnos');
    const data: Shift[] = await response.json();
    setShifts(data);
    const initialAssignedItems = data.reduce((acc, shift) => {
      acc[shift.id] = (shift.menuItems || []).filter(item => item.isActive);
      return acc;
    }, {} as { [key: number]: MenuItem[] });
    setAssignedItems(initialAssignedItems);
    if (data.length > 0) {
      setActiveShiftId(prevId => prevId ?? data[0].id);
    }
  }, [baseUrl]);

  const fetchMenuItems = useCallback(async (shiftId: number) => {
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(`${baseUrl}/menu-items?shiftId=${shiftId}&date=${today}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Error al cargar los ítems del menú');
    const data: MenuItem[] = await response.json();
    setMenuItems(data.filter(item => item.isActive));
  }, [baseUrl]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchShifts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchShifts]);

  useEffect(() => {
    if (activeShiftId) {
      setMenuItems([]);
      fetchMenuItems(activeShiftId).catch(err => {
        setError(err instanceof Error ? err.message : 'Error al cargar ítems del menú');
      });
    }
  }, [activeShiftId, fetchMenuItems]);

  const updateShiftMenuItems = useCallback(async (shiftId: number, items: MenuItem[]) => {
    const token = localStorage.getItem('token');
    const menuItemIds = items.map(i => i.id);
    try {
      const response = await fetch(`${baseUrl}/shifts/${shiftId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ menuItemIds }),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar el menú del turno');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido al guardar');
    }
  }, [baseUrl]);

  const handleDrop = useCallback(async (item: MenuItem) => {
    if (activeShiftId) {
      const newAssigned = [...(assignedItems[activeShiftId] || []), item];
      setAssignedItems(prev => ({
        ...prev,
        [activeShiftId]: newAssigned,
      }));
      await updateShiftMenuItems(activeShiftId, newAssigned);
    }
  }, [activeShiftId, assignedItems, updateShiftMenuItems]);

  const handleRemove = async (itemId: number): Promise<void> => {
    if (activeShiftId) {
      const newAssigned = (assignedItems[activeShiftId] || []).filter(item => item.id !== itemId);
      setAssignedItems(prev => ({
        ...prev,
        [activeShiftId]: newAssigned,
      }));
      await updateShiftMenuItems(activeShiftId, newAssigned);
    }
  };

  const groupedMenuItems = useMemo(() => {
    const currentAssignedIds = new Set((activeShiftId ? assignedItems[activeShiftId] : []).map(i => i.id));
    const availableItems = menuItems.filter(item => !currentAssignedIds.has(item.id));

    return availableItems.reduce((acc, item) => {
      const categoryName = item.category?.name || 'Sin Categoría';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(item);
      return acc;
    }, {} as { [key: string]: MenuItem[] });
  }, [menuItems, activeShiftId, assignedItems]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const isMobile = window.innerWidth <= 768;
  const Backend = isMobile ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={Backend}>
      <div className="container-fluid mt-3">
        <ShiftDashboard
          shifts={shifts}
          activeShiftId={activeShiftId}
          setActiveShiftId={setActiveShiftId}
          groupedMenuItems={groupedMenuItems}
          assignedItems={assignedItems}
          handleDrop={handleDrop}
          handleRemove={handleRemove}
        />
      </div>
    </DndProvider>
  );
};

export default ShiftMenuAssignment;