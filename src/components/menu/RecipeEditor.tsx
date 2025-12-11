import React, { useState, useEffect } from "react";
import type { Ingredient } from "../../types/ingtredient";
import type { RecipeInput } from "../../types/recipe";

interface Props {
  editingItem: any | null;
  ingredients: Ingredient[];
  recipeState: [RecipeInput[], React.Dispatch<React.SetStateAction<RecipeInput[]>>];
}

const RecipeEditor: React.FC<Props> = ({
  editingItem,
  ingredients,
  recipeState
}) => {

  const [recipeIngredients, setRecipeIngredients] = recipeState;

  const [newIng, setNewIng] = useState({
    ingredientId: "",
    quantity: "1"
  });

  const selectedIngredient = ingredients.find(i => i.id === parseInt(newIng.ingredientId));
  const unit = selectedIngredient?.unit;

  useEffect(() => {
    if (editingItem?.recipeIngredients) {
      setRecipeIngredients(editingItem.recipeIngredients.map((r: any) => ({
        ingredientId: r.ingredient.id,
        quantity: r.quantity
      })));
    } else {
      setRecipeIngredients([]);
    }
  }, [editingItem, setRecipeIngredients]);

  const handleIngChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewIng(prev => ({ ...prev, [name]: value }));
  };

  const addIngredient = () => {
    const ing = ingredients.find(i => i.id === parseInt(newIng.ingredientId));
    if (!ing) return;

    setRecipeIngredients(prev => [
      ...prev,
      {
        ingredientId: ing.id,
        quantity: parseFloat(newIng.quantity)
      }
    ]);

    setNewIng({ ingredientId: "", quantity: "1" });
  };

  return (
    <div className="p-3 mb-4 border rounded">
      <h5 className="mb-3">Receta (Opcional)</h5>

      {/* Selector */}
      <div className="row g-3 align-items-end mb-3">
        <div className="col-md-6">
          <label className="form-label">Ingrediente</label>
          <select
            name="ingredientId"
            value={newIng.ingredientId}
            className="form-select"
            onChange={handleIngChange}
          >
            <option value="">Seleccione...</option>
            {ingredients.map(ing => (
              <option key={ing.id} value={ing.id}>
                {ing.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Cantidad</label>
          <div className="input-group">
            <input
              type="number"
              name="quantity"
              value={newIng.quantity}
              className="form-control"
              onChange={handleIngChange}
            />
            {unit && <span className="input-group-text">{unit}</span>}
          </div>
        </div>

        <div className="col-md-2">
          <button type="button" className="btn btn-success w-100" onClick={addIngredient}>
            Agregar
          </button>
        </div>
      </div>

      {/* Tabla */}
      {recipeIngredients.length > 0 && (
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>Cant.</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {recipeIngredients.map((r) => {
              const ing = ingredients.find(i => i.id === r.ingredientId);

              return (
                <tr key={r.ingredientId}>
                  <td>{ing?.name ?? "?"}</td>
                  <td>{r.quantity}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        setRecipeIngredients(prev =>
                          prev.filter(item => item.ingredientId !== r.ingredientId)
                        )
                      }
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      )}
    </div>
  );
};

export default RecipeEditor;
