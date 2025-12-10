import React, { useState } from "react";
import IngredientForm from "../components/ingredient/IngredientForm"
import IngredientTable from "../components/ingredient/IngredientTable";
import { useIngredients } from "../hooks/useIngredients";
import type { CreateIngredientDto } from "../services/ingredient.service";

const ItemIngredientManager: React.FC = () => {
  const { ingredients, editing, loading, error, setEditing, saveIngredient } = useIngredients();
  const [dto, setDto] = useState<CreateIngredientDto>({ name: "", unit: "unit" });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setDto(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveIngredient(dto);
    setDto({ name: "", unit: "unit" });
  };

  const handleEdit = (ingredient: any) => {
    setEditing(ingredient);
    setDto({ ...ingredient });
  };

  const cancelEdit = () => {
    setEditing(null);
    setDto({ name: "", unit: "unit" });
  };

  return (
    <div className="card">
      <div className="card-body">

        <IngredientForm
          dto={dto}
          editing={editing}
          loading={loading}
          error={error}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={cancelEdit}
        />

        <IngredientTable ingredients={ingredients} onEdit={handleEdit} />

      </div>
    </div>
  );
};

export default ItemIngredientManager;
