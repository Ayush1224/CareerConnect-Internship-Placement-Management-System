const ConfirmDialog = ({ open, title, message, onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal modal--sm" onClick={(event) => event.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal__actions">
          <button className="btn btn--secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn--danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
