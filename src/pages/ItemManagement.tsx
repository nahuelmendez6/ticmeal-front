import React, { useState, useMemo, useEffect, useCallback } from 'react';
import CategoryTabs from '../components/menu/CategoryTabs';
import ItemForm from '../components/menu/ItemForm';
import ItemList from '../components/menu/ItemList';
import RecipeEditor from '../components/menu/RecipeEditor';
import DeleteModal from '../components/menu/DeleteModal';
import { useMenuItems } from '../hooks/useMenu';
import { useRecipes } from '../hooks/useRecipes';
import { categoriesService } from '../services/categories.service';
import { ingredientsService } from '../services/ingredient.service';
import type { Category, MenuItem } from '../types/menu';
import type { Ingredient } from '../types/ingtredient';
import type { RecipeInput, RecipeIngredient } from '../types/recipe';

// --- Main Component ---
const ItemManagement: React.FC = () => {
  const { items, fetchItems, createItem, updateItem, deleteItem } = useMenuItems();
  const token = localStorage.getItem('token') || '';
  const { syncRecipe } = useRecipes(token);

  const [categories, setCategories] = useState<Category[]>([]);
  const [systemIngredients, setSystemIngredients] = useState<Ingredient[]>([]);
  const [recipeInputs, setRecipeInputs] = useState<RecipeInput[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newItem, setNewItem] = useState({
    name: '',
    stock: 0,
    minStock: 0,
    categoryId: '',
    maxOrder: 0,
    cost: 0,
    iconName: 'Coffee',
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!token) throw new Error('No autenticado');

        const categoriesData = await categoriesService.getAll(token);
        setCategories(categoriesData);

        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].name);
          setNewItem(prev => ({ ...prev, categoryId: categoriesData[0].id.toString() }));
        }

        await fetchItems();

        const ingredientsData = await ingredientsService.getAll(token);
        setSystemIngredients(ingredientsData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchItems, token]);

  useEffect(() => {
    // Si estamos cargando o no hay una categoría seleccionada, no hacemos nada.
    if (loading || !selectedCategory) return;

    // Verificamos si la categoría actual todavía tiene ítems.
    const categoryHasItems = items.some(item => item.category?.name === selectedCategory);

    if (!categoryHasItems) {
      // Si no tiene, buscamos la primera categoría que sí tenga ítems y la seleccionamos.
      const nextCategoryWithItems = categories.find(cat => items.some(item => item.category?.id === cat.id));
      setSelectedCategory(nextCategoryWithItems ? nextCategoryWithItems.name : null);
    }
  }, [items, categories, selectedCategory, loading]);

  const handleSubmit = async (formData: typeof newItem, recipeData: RecipeInput[]) => {
    setIsSubmitting(true);
    setError(null);

    // 1. Preparar el payload solo con los datos del ítem, sin la receta.
    const itemPayload = {
      ...formData,
      categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : undefined,
    };

    try {
      if (editingItem) {
        // A. Si estamos editando:
        // Primero, actualizamos el ítem del menú.
        await updateItem(editingItem.id, itemPayload);
        // Segundo, sincronizamos la receta usando el hook useRecipes.
        await syncRecipe(editingItem, recipeData);
      } else {
        // B. Si estamos creando:
        // Primero, creamos el ítem y obtenemos el objeto guardado con su nuevo ID.
        const savedItem = await createItem(itemPayload);
        // Segundo, si se creó bien y hay una receta, la sincronizamos.
        if (savedItem && savedItem.id && recipeData.length > 0) {
          const itemForRecipeSync = { id: savedItem.id, recipeIngredients: [] };
          await syncRecipe(itemForRecipeSync, recipeData);
        }
      }

      handleCancelEdit();
      await fetchItems(); // Recargamos los ítems para ver los cambios.
    } catch (err) {
      setError(err instanceof Error ? err.message : `Ocurrió un error al ${editingItem ? 'actualizar' : 'crear'} el ítem`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      stock: item.stock,
      minStock: item.minStock ?? 0,
      maxOrder: item.maxOrder ?? 0,
      cost: item.cost ?? 0,
      categoryId: String(item.category?.id ?? ''),
      iconName: item.iconName ?? 'Coffee',
    });

    const existingRecipeInputs: RecipeInput[] = item.recipeIngredients.map((ri: RecipeIngredient) => ({
      ingredientId: ri.ingredient.id,
      quantity: ri.quantity,
    }));

    setRecipeInputs(existingRecipeInputs);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewItem({
      name: '',
      stock: 0,
      minStock: 0,
      maxOrder: 0,
      categoryId: categories.length > 0 ? String(categories[0].id) : '',
      cost: 0,
      iconName: 'Coffee',
    });
    setRecipeInputs([]);
  };

  const handleDeleteClick = (itemId: number) => {
    setItemToDelete(itemId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await deleteItem(itemToDelete);
      await fetchItems(); // Volvemos a cargar los ítems para reflejar la eliminación.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error al eliminar el ítem');
    } finally {
      setIsSubmitting(false);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredItems = useMemo(() => {
    if (!selectedCategory) return [];
    return items.filter(item => item.category?.name === selectedCategory);
  }, [items, selectedCategory]);


  return (
    <div className="card">
      <div className="card-body">
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {/* --- Form Section --- */}
        <ItemForm
          editingItem={editingItem}
          categories={categories}
          onSubmit={handleSubmit}
          newItemState={newItem}
          setNewItemState={setNewItem}
          recipeIngredients={recipeInputs}
        />

 {/* --- Recipe Section --- */}
        <RecipeEditor
          editingItem={editingItem}
          ingredients={systemIngredients}
          recipeState={[recipeInputs, setRecipeInputs]}
        />

        {/* --- List Section --- */}
        <div>
          {/* Category Tabs */}
          {loading ? (
            <div className="text-center"><div className="spinner-border spinner-border-sm" role="status"><span className="visually-hidden">Cargando...</span></div></div>
          ) : (
            <CategoryTabs
              categories={categories}
              items={items.map(item => ({
                ...item,
                category: item.category ?? undefined,
              }))}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}

          {/* Items Table */}
          <ItemList
            items={filteredItems}
            selectedCategory={selectedCategory}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        loading={isSubmitting}
      />
    </div>
  );
};

export default ItemManagement;