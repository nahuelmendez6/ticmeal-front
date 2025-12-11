import React from "react";
import type { SystemIngredient } from "../../services/ingredient.service";
import { FilePenLine, Trash2 } from "lucide-react";

interface Props {
  ingredients: SystemIngredient[];
  onEdit: (ing: SystemIngredient) => void;
  onDelete: (id: number) => void;
}

const IngredientTable: React.FC<Props> = ({ ingredients, onEdit, onDelete }) => {
  return (
    <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto' }}>
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th style={{ position: 'sticky', top: 0, zIndex: 1 }}>Nombre</th>
            <th style={{ position: 'sticky', top: 0, zIndex: 1 }}>Stock</th>
            <th style={{ position: 'sticky', top: 0, zIndex: 1 }}>Unidad</th>
            <th style={{ position: 'sticky', top: 0, zIndex: 1 }}>Costo</th>
            <th style={{ position: 'sticky', top: 0, zIndex: 1 }} />
          </tr>
        </thead>
        <tbody>
          {ingredients
            .filter(i => i.isActive !== false) // Solo mostrar ingredientes activos
            .map(i => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.quantityInStock ?? "-"}</td>
              <td>{i.unit}</td>
              <td>{i.cost ? `$${i.cost}` : "-"}</td>
              <td>
                <button className="btn btn-sm btn-outline-primary me-2" onClick={() => onEdit(i)}>
                  <FilePenLine size={18} />
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(i.id)}>
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IngredientTable;
