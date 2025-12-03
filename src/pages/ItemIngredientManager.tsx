import React, { useState, useEffect, useCallback } from 'react';
import { FilePenLine } from 'lucide-react';

/**
 * Interfaz para la receta de un ítem.
 * Interfaz para definir la estructura de un ingrediente.
 */
interface Ingredient {
  id: string | number;
  name: string;
  quantity: number;
  unit: string;
}

/**
 * DTO para crear un nuevo ingrediente en el sistema.
 */
interface CreateIngredientDto {
  name: string;
  quantityInStock?: number;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'unit';
  cost?: number;
  costType?: 'per_unit' | 'per_kg' | 'per_lt';
  description?: string;
  categoryId?: number;
  minStock?: number;
}

/**
 * Interfaz para un ingrediente del sistema (con ID).
 */
interface SystemIngredient extends CreateIngredientDto {
  id: number;
}
const ItemIngredientManager: React.FC = () => {
  // Estado para la lista de ingredientes de la receta
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    // Puedes inicializarlo con datos de ejemplo o vacío
    { id: 1, name: 'Pan', quantity: 2, unit: 'unidad' },
    { id: 2, name: 'Queso', quantity: 100, unit: 'gr' },
  ]);

  // Estado para los campos del formulario de adición
  const [newIngredient, setNewIngredient] = useState({ name: '', quantity: '', unit: '' });
  const [systemIngredients, setSystemIngredients] = useState<SystemIngredient[]>([]);
  const [ingredientDto, setIngredientDto] = useState<CreateIngredientDto>({ name: '', unit: 'unit' });
  const [editingIngredient, setEditingIngredient] = useState<SystemIngredient | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemIngredients = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No autenticado');
      const response = await fetch('http://localhost:3000/ingredients', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Error al cargar los ingredientes del sistema');
      const data: SystemIngredient[] = await response.json();
      setSystemIngredients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar ingredientes');
    }
  }, []);

  useEffect(() => {
    fetchSystemIngredients();
  }, [fetchSystemIngredients]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewIngredient(prev => ({ ...prev, [name]: value }));
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const quantityNum = parseFloat(newIngredient.quantity);
    if (newIngredient.name && !isNaN(quantityNum) && quantityNum > 0 && newIngredient.unit) {
      const ingredientToAdd: Ingredient = {
        id: Date.now(), // Usamos un ID temporal para el ejemplo
        name: newIngredient.name,
        quantity: quantityNum,
        unit: newIngredient.unit,
      };
      setIngredients(prev => [...prev, ingredientToAdd]);
      setNewIngredient({ name: '', quantity: '', unit: '' }); // Limpiar formulario
    }
  };

  const handleDeleteIngredient = (ingredientId: number | string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== ingredientId));
  };

  const handleDtoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIngredientDto(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: CreateIngredientDto = {
      ...ingredientDto,
      quantityInStock: Number(ingredientDto.quantityInStock) || 0,
      cost: Number(ingredientDto.cost) || undefined,
      minStock: Number(ingredientDto.minStock) || undefined,
      categoryId: Number(ingredientDto.categoryId) || undefined,
    };

    const url = editingIngredient
      ? `http://localhost:3000/ingredients/${editingIngredient.id}`
      : 'http://localhost:3000/ingredients';
    const method = editingIngredient ? 'PATCH' : 'POST';

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
        const errorData = await response.json().catch(() => ({ message: `Error al ${editingIngredient ? 'actualizar' : 'crear'} el ingrediente` }));
        throw new Error(errorData.message || `Error al ${editingIngredient ? 'actualizar' : 'crear'} el ingrediente`);
      }

      setIngredientDto({ name: '', unit: 'unit' });
      setEditingIngredient(null);
      await fetchSystemIngredients();

    } catch (err) {
      setError(err instanceof Error ? err.message : `Ocurrió un error desconocido al ${editingIngredient ? 'actualizar' : 'crear'} el ingrediente`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (ingredient: SystemIngredient) => {
    setEditingIngredient(ingredient);
    setIngredientDto({
      name: ingredient.name,
      unit: ingredient.unit,
      quantityInStock: ingredient.quantityInStock ?? 0,
      minStock: ingredient.minStock ?? 0,
      cost: ingredient.cost ?? 0,
      costType: ingredient.costType ?? undefined,
      description: ingredient.description ?? '',
      categoryId: ingredient.categoryId ?? undefined,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingIngredient(null);
    setIngredientDto({ name: '', unit: 'unit' });
  };

  return (
    <div className="card">
      <div className="card-body">
        {/* Formulario para Crear Nuevo Ingrediente */}
        <div className="p-3 mb-4 border rounded">
          <h5 className="mb-3">{editingIngredient ? 'Editar Ingrediente' : 'Crear Nuevo Ingrediente'}</h5>
          <form onSubmit={handleSubmitIngredient}>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label htmlFor="name" className="form-label">Nombre</label>
                <input type="text" id="name" name="name" className="form-control form-control-sm" value={ingredientDto.name} onChange={handleDtoChange} required />
              </div>
              <div className="col-md-2">
                <label htmlFor="unit" className="form-label">Unidad</label>
                <select id="unit" name="unit" className="form-select form-select-sm" value={ingredientDto.unit} onChange={handleDtoChange}>
                  <option value="unit">Unidad</option>
                  <option value="kg">Kilogramo (kg)</option>
                  <option value="g">Gramo (g)</option>
                  <option value="ml">Mililitro (ml)</option>
                  <option value="l">Litro (l)</option>
                </select>
              </div>
              <div className="col-md-2">
                <label htmlFor="quantityInStock" className="form-label">Stock Inicial</label>
                <input type="number" id="quantityInStock" name="quantityInStock" className="form-control form-control-sm" value={ingredientDto.quantityInStock ?? ''} onChange={handleDtoChange} />
              </div>
              <div className="col-md-2">
                <label htmlFor="minStock" className="form-label">Stock Mínimo</label>
                <input type="number" id="minStock" name="minStock" className="form-control form-control-sm" value={ingredientDto.minStock ?? ''} onChange={handleDtoChange} />
              </div>
              <div className="col-md-2">
                <label htmlFor="cost" className="form-label">Costo</label>
                <input type="number" step="0.01" id="cost" name="cost" className="form-control form-control-sm" value={ingredientDto.cost ?? ''} onChange={handleDtoChange} />
              </div>
            </div>
            <div className="d-flex justify-content-end mt-3">
              {editingIngredient && (
                <button type="button" className="btn btn-secondary me-2" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (editingIngredient ? 'Actualizando...' : 'Creando...') : (editingIngredient ? 'Actualizar Ingrediente' : 'Crear Ingrediente')}
              </button>
            </div>
          </form>
        </div>

        <hr />

        {/* Tabla de Ingredientes del Sistema */}
        <h5 className="card-title">Ingredientes del Sistema</h5>
        <div className="table-responsive mb-4">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Stock</th>
                <th>Unidad</th>
                <th>Costo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {systemIngredients.map(ing => (
                <tr key={ing.id}>
                  <td>{ing.name}</td>
                  <td>{ing.quantityInStock ?? '-'}</td>
                  <td>{ing.unit}</td>
                  <td>{ing.cost ? `$${ing.cost}` : '-'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" title="Editar" style={{ border: 'none' }} onClick={() => handleEditClick(ing)}>
                      <FilePenLine size={18} />
                    </button>
                    {/* Aquí podrías agregar un botón de eliminar para ingredientes del sistema */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <hr />

        {/* <h5 className="card-title">Receta del Ítem</h5>
        <table className="table">
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>Cantidad</th>
              <th>Unidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map(ing => (
              <tr key={ing.id}>
                <td>{ing.name}</td>
                <td>{ing.quantity}</td>
                <td>{ing.unit}</td>
                <td>
                  <button className="btn btn-sm btn-outline-danger" style={{ border: 'none' }} onClick={() => handleDeleteIngredient(ing.id)}>
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table> */}

        {/* <hr /> */}

        {/* Formulario de Adición */}
        {/* <form onSubmit={handleAddIngredient}>
          <div className="row g-3 align-items-end">
            <div className="col-md-4"><input type="text" name="name" className="form-control" placeholder="Seleccionar..." value={newIngredient.name} onChange={handleInputChange} required /></div>
            <div className="col-md-3"><input type="number" name="quantity" step="0.01" className="form-control" placeholder="Ej: 0.5" value={newIngredient.quantity} onChange={handleInputChange} required /></div>
            <div className="col-md-3"><input type="text" name="unit" className="form-control" placeholder="kg, gr, ml, unidad" value={newIngredient.unit} onChange={handleInputChange} required /></div>
            <div className="col-md-2"><button type="submit" className="btn btn-success w-100">Agregar</button></div>
          </div>
        </form> */}
      </div>
    </div>
  );
};

export default ItemIngredientManager;