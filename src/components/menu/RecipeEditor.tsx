import React, { useState } from "react";

interface Props {
  editingItem: any | null;
  ingredients: any[];
  recipeIngredients?: any[];
  setRecipeIngredients?: any;
}

const RecipeEditor: React.FC<Props> = ({
  ingredients,
  recipeIngredients,
  setRecipeIngredients
}) => {

  const [newIng, setNewIng] = useState({
    ingredientId: "",
    quantity: "1"
  });

  const handleIngChange = (e: any) => {
    const { name, value } = e.target;
    setNewIng(prev => ({ ...prev, [name]: value }));
  };

  const addIngredient = () => {
    const ing = ingredients.find(i => i.id === parseInt(newIng.ingredientId));
    if (!ing) return;

    setRecipeIngredients((prev: any[]) => [
      ...prev,
      {
        ingredientId: ing.id,
        name: ing.name,
        quantity: parseFloat(newIng.quantity),
        unit: ing.unit
      }
    ]);

    setNewIng({ ingredientId: "", quantity: "1" });
  };

  return (
    <div className="p-3 mb-4 border rounded">
      <h5 className="mb-3">Receta (Opcional)</h5>

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
          <input
            type="number"
            name="quantity"
            value={newIng.quantity}
            className="form-control"
            onChange={handleIngChange}
          />
        </div>

        <div className="col-md-2">
          <button type="button" className="btn btn-success w-100" onClick={addIngredient}>
            Agregar
          </button>
        </div>
      </div>

      {recipeIngredients?.length > 0 && (
        <table className="table table-sm">
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>Cant.</th>
              <th>Unidad</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {recipeIngredients.map((r, idx) => (
              <tr key={idx}>
                <td>{r.name}</td>
                <td>{r.quantity}</td>
                <td>{r.unit}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() =>
                      setRecipeIngredients((prev: any[]) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
};

export default RecipeEditor;
