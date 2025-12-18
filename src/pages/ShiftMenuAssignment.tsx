import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import type { ConnectDragSource, ConnectDropTarget } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Plus, 
  Coffee, 
  Sandwich, 
  Apple, 
  Pizza, 
  Trash2, 
  FilePenLine,
  Beef,
  Hamburger,
  IceCreamBowl,
  Salad,
  Soup,
  Utensils,
  BottleWine,
  Banana,
  Cookie,
  Croissant,
  Dessert,
  Drumstick,
  EggFried,
  Ham,
  IceCreamCone,
  CupSoda,
  CakeSlice,
  Beer,
  Torus,
  Donut,
  Egg,
  GlassWater,
  Milk,
} from 'lucide-react';

const ItemTypes = {
  MENU_ITEM: 'menu_item',
};

const iconMap: { [key: string]: React.ElementType } = {
  Plus, Coffee, Sandwich, Apple, Pizza, Trash2, FilePenLine, Beef, Hamburger, IceCreamBowl, Salad, Soup, Utensils, BottleWine, Banana, Cookie, Croissant, Dessert, Drumstick, EggFried, Ham, IceCreamCone, CupSoda, CakeSlice, Beer, Torus, Donut, Egg, GlassWater, Milk,
  default: Utensils,
};

const IconComponent: React.FC<{ iconName: string | null }> = ({ iconName }) => {
  const Icon = iconName ? (iconMap[iconName] || iconMap.default) : iconMap.default;
  return <Icon size={18} className="me-2" />;
};

interface MenuItem {
  id: number;
  name:string;
  category: { id: number; name: string } | null;
  iconName: string | null;
  isActive: boolean;
}

interface Shift {
  id: number;
  name: string;
  menuItems: MenuItem[];
}

interface DraggableMenuItemProps {
  item: MenuItem;
}

const DraggableMenuItem: React.FC<DraggableMenuItemProps> = ({ item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MENU_ITEM,
    item: { ...item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag as unknown as React.Ref<HTMLDivElement>} className="list-group-item list-group-item-action" style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
      <IconComponent iconName={item.iconName} />
      {item.name}
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
        <div className="col-md-6">
          <h5>Ítems Disponibles</h5>
          {Object.keys(groupedMenuItems).length > 0 ? (
            Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category} className="mb-3">
                <h6>{category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                <div className="list-group">
                  {items.map(item => (
                    <DraggableMenuItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted p-5 card bg-light">
              No hay más ítems para asignar a este turno.
            </div>
          )}
        </div>

        <div className="col-md-6">
          <div ref={drop as unknown as React.Ref<HTMLDivElement>} className="card bg-light" style={{ minHeight: '400px' }}>
            <div className="card-header">
              Menú del Turno: {shifts.find(s => s.id === activeShiftId)?.name}
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
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(item.id)}>
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center text-muted p-5">
                  Arrastra ítems aquí para asignarlos a este turno.
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
      acc[shift.id] = shift.menuItems || [];
      return acc;
    }, {} as { [key: number]: MenuItem[] });
    setAssignedItems(initialAssignedItems);
    if (data.length > 0) {
      setActiveShiftId(data[0].id);
    }
  }, [baseUrl]);

  const fetchMenuItems = useCallback(async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseUrl}/menu-items`, {
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
        await Promise.all([fetchShifts(), fetchMenuItems()]);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setLoading(false);
      }
    };
    loadData();
  }, [fetchShifts, fetchMenuItems]);

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
      <ShiftDashboard
        shifts={shifts}
        activeShiftId={activeShiftId}
        setActiveShiftId={setActiveShiftId}
        groupedMenuItems={groupedMenuItems}
        assignedItems={assignedItems}
        handleDrop={handleDrop}
        handleRemove={handleRemove}
      />
    </DndProvider>
  );
};

export default ShiftMenuAssignment;