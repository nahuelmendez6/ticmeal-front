import React, { useState } from "react";
import IngredientForm from "../components/ingredient/IngredientForm"
import IngredientTable from "../components/ingredient/IngredientTable";
import { useIngredients } from "../hooks/useIngredients";
import type { CreateIngredientDto } from "../services/ingredient.service";
import DeleteModal from "../components/menu/DeleteModal";

const ItemIngredientManager: React.FC = () => {
  const { ingredients, editing, loading, error, setEditing, saveIngredient, removeIngredient } = useIngredients();
  const [dto, setDto] = useState<CreateIngredientDto>({ name: "", unit: "unit" });

  // Estado para el modal de confirmación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [ingredientToDelete, setIngredientToDelete] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, dataset } = e.target as HTMLInputElement;

    // Parsea el valor si el input es de tipo numérico, si no, lo deja como string.
    // Si el campo numérico está vacío, lo deja como está para que se muestre el placeholder.
    const finalValue = dataset.type === 'number'
      ? (value === '' ? '' : parseFloat(value))
      : value;

    setDto(prevDto => ({
      ...prevDto,
      [name]: finalValue,
    }));
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

  // Abre el modal de confirmación
  const handleDeleteRequest = (id: number) => {
    setIngredientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Cierra el modal
  const handleCloseModal = () => {
    setIsDeleteModalOpen(false);
    setIngredientToDelete(null);
  };

  // Confirma y ejecuta la eliminación
  const handleConfirmDelete = async () => {
    if (ingredientToDelete) await removeIngredient(ingredientToDelete);
    handleCloseModal();
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

        <IngredientTable ingredients={ingredients} onEdit={handleEdit} onDelete={handleDeleteRequest} />

      </div>

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />

    </div>
  );
};

export default ItemIngredientManager;
