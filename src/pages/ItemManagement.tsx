import React, { useState, useMemo, useEffect, useCallback } from 'react';
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

// --- Mock Data and Types ---
interface MenuItem {
  id: number;
  name: string;
  stock: number | null;
  minStock: number | null;
  cost: string | null;
  category: Category | null;
  iconName: string | null;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  Coffee,
  Sandwich,
  Apple,
  Pizza,
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
};

const IconComponent: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = iconMap[iconName] || Coffee;
  return <Icon size={18} className="me-2" />;
};

// --- Main Component ---
const ItemManagement: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [newItem, setNewItem] = useState({
    name: '',
    stock: '0',
    minStock: '0',
    categoryId: '',
    cost: '0',
    iconName: 'Coffee',
  });

  const fetchMenuItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');
      const response = await fetch('http://localhost:3000/menu-items', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al cargar los ítems del menú');
      const itemsData: MenuItem[] = await response.json();
      // Filtrar para mostrar solo los ítems activos
      setItems(itemsData.filter(item => item.isActive));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar ítems');
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No autenticado');

        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:3000/categories/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!categoriesResponse.ok) throw new Error('Error al cargar las categorías');
        const categoriesData: Category[] = await categoriesResponse.json();
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].name);
          setNewItem(prev => ({ ...prev, categoryId: String(categoriesData[0].id) }));
        }

        // Fetch menu items
        await fetchMenuItems();

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchMenuItems]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      name: newItem.name || undefined,
      stock: parseInt(newItem.stock, 10) || 0,
      minStock: parseInt(newItem.minStock, 10) || 0,
      cost: parseFloat(newItem.cost) || 0,
      iconName: newItem.iconName,
      categoryId: parseInt(newItem.categoryId, 10),
    };

    const url = editingItem
      ? `http://localhost:3000/menu-items/${editingItem.id}`
      : 'http://localhost:3000/menu-items';
    const method = editingItem ? 'PATCH' : 'POST';

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Error al ${editingItem ? 'actualizar' : 'crear'} el ítem` }));
        throw new Error(errorData.message || `Error al ${editingItem ? 'actualizar' : 'crear'} el ítem`);
      }

      // Re-fetch items to get the updated list
      await fetchMenuItems();

      // Reset form
      setNewItem({
        name: '',
        stock: '0',
        minStock: '0',
        categoryId: categories.length > 0 ? String(categories[0].id) : '',
        cost: '0',
        iconName: 'Coffee',
      });
      setEditingItem(null);

    } catch (err) {
      setError(err instanceof Error ? err.message : `Ocurrió un error al ${editingItem ? 'actualizar' : 'crear'} el ítem`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      stock: String(item.stock ?? '0'),
      minStock: String(item.minStock ?? '0'),
      cost: String(item.cost ?? '0'),
      categoryId: String(item.category?.id ?? ''),
      iconName: item.iconName ?? 'Coffee',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    // Reset form to its initial state for creation
    setNewItem({ name: '', stock: '0', minStock: '0', categoryId: categories.length > 0 ? String(categories[0].id) : '', cost: '0', iconName: 'Coffee' });
  };

  const handleDeleteClick = async (itemId: number) => {
    setItemToDelete(itemId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');

      const response = await fetch(`http://localhost:3000/menu-items/${itemToDelete}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: false }),
      });

      if (!response.ok) throw new Error('Error al eliminar el ítem');
      await fetchMenuItems(); // Re-fetch para actualizar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al eliminar el ítem');
    } finally {
      setSubmitting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };
  const formatCategoryName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return items.filter(item => item.category?.name === selectedCategory);
  }, [items, selectedCategory]);

  const displayedCategories = useMemo(() => {
    const usedCategoryIds = new Set<number>();
    items.forEach(item => {
      if (item.category) {
        usedCategoryIds.add(item.category.id);
      }
    });
    return categories.filter(cat => usedCategoryIds.has(cat.id));
  }, [items, categories]);


  return (
    <div className="card">
      <div className="card-body">
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {/* --- Form Section --- */}
        <div className="p-3 mb-4 border rounded">
          <form className="row g-3 align-items-end" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <label htmlFor="itemName" className="form-label">Nombre</label>
              <input type="text" className="form-control" id="itemName" name="name" value={newItem.name} onChange={handleInputChange} required />
            </div>
            <div className="col-md-1">
              <label htmlFor="itemStock" className="form-label">Stock</label>
              <input type="number" className="form-control" id="itemStock" name="stock" value={newItem.stock} onChange={handleInputChange} />
            </div>
            <div className="col-md-1">
              <label htmlFor="itemMinStock" className="form-label">Stock Mínimo</label>
              <input type="number" className="form-control" id="itemMinStock" name="minStock" value={newItem.minStock} onChange={handleInputChange} />
            </div>
            <div className="col-md-2">
              <label htmlFor="itemCategory" className="form-label">Categoría</label>
              <select id="itemCategory" name="categoryId" className="form-select" value={newItem.categoryId} onChange={handleInputChange} required>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{formatCategoryName(cat.name)}</option>)}
              </select>
            </div>
            <div className="col-md-2">
              <label htmlFor="itemCost" className="form-label">Costo</label>
              <div className="input-group">
                <span className="input-group-text">$</span>
                <input type="number" step="0.01" className="form-control" id="itemCost" name="cost" value={newItem.cost} onChange={handleInputChange} />
              </div>
            </div>
            <div className="col-md-2">
              <label htmlFor="itemIcon" className="form-label">Ícono</label>
              <select id="itemIcon" name="iconName" className="form-select" value={newItem.iconName} onChange={handleInputChange}>
                {Object.keys(iconMap).map(iconName => (
                  <option key={iconName} value={iconName}>{iconName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-primary w-100" disabled={submitting}>
                {submitting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : (editingItem ? 'Actualizar' : <Plus size={20} />)}
              </button>
              {editingItem && (
                <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* --- List Section --- */}
        <div className="row">
          {/* Category List */}
          <div className="col-md-3">
            {loading ? (
              <div className="text-center"><div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Cargando...</span></div></div>
            ) : (
              <div className="list-group">
                {displayedCategories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`list-group-item list-group-item-action ${selectedCategory === cat.name ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.name)}
                  >
                    {formatCategoryName(cat.name)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="col-md-9">
            <h5 className="mb-3">{selectedCategory ? formatCategoryName(selectedCategory) : 'Seleccione una categoría'}</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Ícono</th>
                    <th>Stock</th>
                    <th>Stock Mínimo</th>
                    <th>Costo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center"><div className="spinner-border" role="status"><span className="visually-hidden">Cargando...</span></div></td></tr>
                  ) : (
                    filteredItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>
                          {item.iconName && <IconComponent iconName={item.iconName} />}
                        </td>
                        <td>{item.stock}</td>
                        <td>{item.minStock}</td>
                        <td>{item.cost ? `$${item.cost}` : '-'}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" title="Editar" style={{ border: 'none' }} onClick={() => handleEditClick(item)}>
                            <FilePenLine size={18} />
                          </button>
                          <button className="btn btn-sm btn-outline-danger" title="Eliminar" style={{ border: 'none' }} onClick={() => handleDeleteClick(item.id)}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button type="button" className="btn-close" onClick={() => setIsDeleteModalOpen(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <p>¿Está seguro de que desea eliminar este ítem? Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={submitting}>Cancelar</button>
                <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={submitting}>{submitting ? 'Eliminando...' : 'Eliminar'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemManagement;