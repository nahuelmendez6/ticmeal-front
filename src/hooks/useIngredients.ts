import { useState, useEffect, useCallback } from "react";
// import { ingredientsService } from "../services/ingredient.service";
// import { ingredientService, SystemIngredient, CreateIngredientDto } from "../services/ingredient.service";
import {
  type SystemIngredient,
  type CreateIngredientDto,
  ingredientsService as ingredientService,
} from "../services/ingredient.service";
import { useAuth } from "../contexts/AuthContext";

export const useIngredients = () => {
  const { token } = useAuth();
  const [ingredients, setIngredients] = useState<SystemIngredient[]>([]);
  const [editing, setEditing] = useState<SystemIngredient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadIngredients = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await ingredientService.getAll(token);
      setIngredients(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadIngredients();
  }, [loadIngredients]);

  const saveIngredient = async (dto: CreateIngredientDto) => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      if (editing) {
        // Fusionamos el estado de edición con los nuevos datos del DTO.
        // Esto asegura que los campos no presentes en el formulario (como categoryId)
        // no se pierdan si ya tenían un valor.
        await ingredientService.update(token, editing.id, { ...editing, ...dto });
      } else {
        await ingredientService.create(token, dto);
      }

      setEditing(null);
      await loadIngredients();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return {
    ingredients,
    editing,
    setEditing,
    loading,
    error,
    saveIngredient,
  };
};
