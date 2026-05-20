export default function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          borderRadius: 12,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              padding: "4px 10px",
              fontSize: 18,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "#6b7280",
              lineHeight: 1,
            }}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>
        <div style={{ padding: 20 }}>
          {children}
        </div>
      </div>
    </div>
  );
}