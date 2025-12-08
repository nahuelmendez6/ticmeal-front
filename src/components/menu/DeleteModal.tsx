import React from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeleteModal: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  loading
}) => {
  if (!open) return null;

  return (
    <div className="modal show" style={{ display: "block", background: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Eliminar Ítem</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            ¿Seguro que desea eliminar este ítem?
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>

            <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
