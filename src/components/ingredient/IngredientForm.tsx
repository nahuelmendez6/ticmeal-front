import React from "react";
import type { CreateIngredientDto, SystemIngredient } from "../../services/ingredient.service";

interface Props {
  dto: CreateIngredientDto;
  editing: SystemIngredient | null;
  loading: boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const IngredientForm: React.FC<Props> = ({
  dto,
  editing,
  loading,
  error,
  onChange,
  onSubmit,
  onCancel
}) => {
  return (
    <div className="p-3 mb-4 border rounded">
      <h5>{editing ? "Editar Ingrediente" : "Crear Ingrediente"}</h5>

      <form onSubmit={onSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Nombre</label>
            <input
              name="name"
              className="form-control"
              value={dto.name}
              onChange={onChange}
              required
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Unidad</label>
            <select name="unit" className="form-select" value={dto.unit} onChange={onChange}>
              <option value="unit">Unidad</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Stock</label>
            <input
              type="number"
              name="quantityInStock"
              className="form-control"
              data-type="number"
              value={dto.quantityInStock ?? ""}
              onChange={onChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Min. Stock</label>
            <input
              type="number"
              name="minStock"
              className="form-control"
              data-type="number"
              value={dto.minStock ?? ""}
              onChange={onChange}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Costo</label>
            <input
              type="number"
              name="cost"
              className="form-control"
              data-type="number"
              value={dto.cost ?? ""}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end mt-3">
          {editing && (
            <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading
              ? editing
                ? "Actualizando..."
                : "Creando..."
              : editing
              ? "Actualizar"
              : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IngredientForm;
