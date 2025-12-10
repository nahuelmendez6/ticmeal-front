import React from "react";
import type { SystemIngredient } from "../../services/ingredient.service";
import { FilePenLine } from "lucide-react";

interface Props {
  ingredients: SystemIngredient[];
  onEdit: (ing: SystemIngredient) => void;
}

const IngredientTable: React.FC<Props> = ({ ingredients, onEdit }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Stock</th>
            <th>Unidad</th>
            <th>Costo</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {ingredients.map(i => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>{i.quantityInStock ?? "-"}</td>
              <td>{i.unit}</td>
              <td>{i.cost ? `$${i.cost}` : "-"}</td>
              <td>
                <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(i)}>
                  <FilePenLine size={18} />
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
