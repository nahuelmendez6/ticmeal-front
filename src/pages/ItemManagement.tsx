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
  recipeIngredients: {
    id: number;
    quantity: number;
    ingredient: {
      id: number;
      name: string;
      unit: string;
    }
  }[];
}

interface Category {
  id: number;
  name: string;
}

interface SystemIngredient {
  id: number;
  name: string;
  unit: string;
}

interface RecipeIngredient {
  ingredientId: number;
  name: string;
  quantity: number;
  unit: string;
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
  const [systemIngredients, setSystemIngredients] = useState<SystemIngredient[]>([]);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const [newRecipeIngredient, setNewRecipeIngredient] = useState({
    ingredientId: '',
    quantity: '1',
  });

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

        // Fetch system ingredients for recipe dropdown
        const ingredientsResponse = await fetch('http://localhost:3000/ingredients', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!ingredientsResponse.ok) throw new Error('Error al cargar los ingredientes');
        const ingredientsData: SystemIngredient[] = await ingredientsResponse.json();
        setSystemIngredients(ingredientsData);
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

  const handleRecipeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRecipeIngredient(prev => ({ ...prev, [name]: value }));
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

      const savedItem: MenuItem = await response.json();

      // --- Guardar la receta ---
      if (recipeIngredients.length > 0) {
        const recipePromises = recipeIngredients.map(recipeIng => {
          const recipePayload = {
            menuItemId: savedItem.id,
            ingredientId: recipeIng.ingredientId,
            quantity: recipeIng.quantity,
          };
          return fetch('http://localhost:3000/recipe-ingredients', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(recipePayload),
          });
        });
        await Promise.all(recipePromises);
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
      setRecipeIngredients([]);
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

    const existingRecipe = item.recipeIngredients.map(ri => ({
      ingredientId: ri.ingredient.id,
      name: ri.ingredient.name,
      quantity: ri.quantity,
      unit: ri.ingredient.unit,
    }));

    setRecipeIngredients(existingRecipe);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    // Reset form to its initial state for creation
    setNewItem({ name: '', stock: '0', minStock: '0', categoryId: categories.length > 0 ? String(categories[0].id) : '', cost: '0', iconName: 'Coffee' });
    setRecipeIngredients([]);
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

  const handleAddRecipeIngredient = () => {
    const ingredientId = parseInt(newRecipeIngredient.ingredientId, 10);
    const quantity = parseFloat(newRecipeIngredient.quantity);
    const selectedIngredient = systemIngredients.find(ing => ing.id === ingredientId);

    if (selectedIngredient && !isNaN(quantity) && quantity > 0) {
      setRecipeIngredients(prev => [...prev, {
        ingredientId: selectedIngredient.id,
        name: selectedIngredient.name,
        quantity: quantity,
        unit: selectedIngredient.unit,
      }]);
      setNewRecipeIngredient({ ingredientId: '', quantity: '1' });
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
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Columna Izquierda */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="itemName" className="form-label">Nombre</label>
                  <input type="text" className="form-control" id="itemName" name="name" value={newItem.name} onChange={handleInputChange} required />
                </div>
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <label htmlFor="itemStock" className="form-label">Stock</label>
                    <input type="number" className="form-control" id="itemStock" name="stock" value={newItem.stock} onChange={handleInputChange} />
                  </div>
                  <div className="col-sm-6 mb-3">
                    <label htmlFor="itemMinStock" className="form-label">Stock Mínimo</label>
                    <input type="number" className="form-control" id="itemMinStock" name="minStock" value={newItem.minStock} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="itemCategory" className="form-label">Categoría</label>
                  <select id="itemCategory" name="categoryId" className="form-select" value={newItem.categoryId} onChange={handleInputChange} required>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{formatCategoryName(cat.name)}</option>)}
                  </select>
                </div>
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <label htmlFor="itemCost" className="form-label">Costo</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input type="number" step="0.01" className="form-control" id="itemCost" name="cost" value={newItem.cost} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="col-sm-6 mb-3">
                    <label htmlFor="itemIcon" className="form-label">Ícono</label>
                    <div className="input-group">
                      <span className="input-group-text"><IconComponent iconName={newItem.iconName} /></span>
                      <select id="itemIcon" name="iconName" className="form-select" value={newItem.iconName} onChange={handleInputChange}>
                        {Object.keys(iconMap).map(iconName => (<option key={iconName} value={iconName}>{iconName}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="d-flex justify-content-end mt-3">
              {editingItem && (
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: '120px' }}>
                {submitting ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : (editingItem ? 'Actualizar' : 'Agregar Ítem')}
              </button>
            </div>
          </form>
        </div>

 {/* --- Recipe Section --- */}
        <div className="p-3 mb-4 border rounded">
          <h5 className="mb-3">Receta (Opcional)</h5>
          
          {useMemo(() => {
            const selectedIngredient = systemIngredients.find(ing => ing.id === parseInt(newRecipeIngredient.ingredientId));
            return (
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-6">
              <label htmlFor="ingredientSelect" className="form-label">Ingrediente</label>
              <select id="ingredientSelect" name="ingredientId" className="form-select" value={newRecipeIngredient.ingredientId} onChange={handleRecipeInputChange}>
                <option value="" disabled>Seleccione un ingrediente...</option>
                {systemIngredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label htmlFor="ingredientQuantity" className="form-label">Cantidad</label>
              <div className="input-group">
                <input type="number" id="ingredientQuantity" name="quantity" className="form-control" value={newRecipeIngredient.quantity} onChange={handleRecipeInputChange} />
                {selectedIngredient && <span className="input-group-text">{selectedIngredient.unit}</span>}
              </div>
            </div>
            <div className="col-md-2">
              <button type="button" className="btn btn-success w-100" onClick={handleAddRecipeIngredient}>Agregar</button>
            </div>
          </div>
            );
          }, [systemIngredients, newRecipeIngredient, handleRecipeInputChange])}

          {recipeIngredients.length > 0 && (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Cantidad</th>
                  <th>Unidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recipeIngredients.map((ing, index) => (
                  <tr key={index}>
                    <td>{ing.name}</td>
                    <td>{ing.quantity}</td>
                    <td>{ing.unit}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" style={{ border: 'none' }} onClick={() => setRecipeIngredients(prev => prev.filter((_, i) => i !== index))}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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