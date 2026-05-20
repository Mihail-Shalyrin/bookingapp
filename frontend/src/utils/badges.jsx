export function loadBadge(load) {
  const config = {
    LOW: { bg: "#d1fae5", color: "#065f46", label: "Низкая" },
    MEDIUM: { bg: "#fef3c7", color: "#92400e", label: "Средняя" },
    HIGH: { bg: "#fee2e2", color: "#991b1b", label: "Высокая" },
  };
  const c = config[load] || config.LOW;
  return (
    <span style={{
      padding: "2px 8px",
      borderRadius: 12,
      background: c.bg,
      color: c.color,
      fontSize: 12,
      fontWeight: 500,
      marginLeft: 8,
    }}>
      {c.label}
    </span>
  );
}

export function typeBadge(type) {
  const config = {
    ROOM: { bg: "#dbeafe", color: "#1e40af", label: "Стол" },
    MEETING: { bg: "#e0e7ff", color: "#3730a3", label: "Переговорка" },
    HALL: { bg: "#fce7f3", color: "#9f1239", label: "Холл" },
  };
  const c = config[type] || config.ROOM;
  return (
    <span style={{
      padding: "2px 8px",
      borderRadius: 4,
      background: c.bg,
      color: c.color,
      fontSize: 12,
      fontWeight: 500,
    }}>
      {c.label}
    </span>
  );
}