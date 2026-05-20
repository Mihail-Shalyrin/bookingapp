import { useState, useEffect } from "react";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

function typeLabel(type) {
  const map = { ROOM: "Стол", MEETING: "Переговорка", HALL: "Холл" };
  return map[type] || type;
}

function typeBadge(type) {
  const colors = {
    ROOM: { bg: "#dbeafe", color: "#1e40af" },
    MEETING: { bg: "#e0e7ff", color: "#3730a3" },
    HALL: { bg: "#fce7f3", color: "#9f1239" },
  };
  const c = colors[type] || colors.ROOM;
  return (
    <span style={{
      padding: "2px 8px",
      borderRadius: 4,
      background: c.bg,
      color: c.color,
      fontSize: 12,
      fontWeight: 500,
    }}>
      {typeLabel(type)}
    </span>
  );
}

function modeBadge(mode) {
  const isWeekly = mode === "WEEKLY";
  return (
    <span style={{
      padding: "2px 8px",
      borderRadius: 4,
      background: isWeekly ? "#fef3c7" : "#f3f4f6",
      color: isWeekly ? "#92400e" : "#4b5563",
      fontSize: 11,
      fontWeight: 500,
    }}>
      {isWeekly ? "Еженедельно" : "Разовая"}
    </span>
  );
}

function formatDateTime(dt) {
  const [date, time] = dt.split("T");
  const [y, m, d] = date.split("-");
  return `${d}.${m}.${y} ${time.slice(0, 5)}`;
}

function isUpcoming(endTime) {
  return new Date(endTime) > new Date();
}

export default function MyBookingsPage() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get("/api/user/me");
      setOffices(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  async function deleteBooking(bookingId) {
    if (!confirm("Удалить бронь?")) return;
    try {
      await api.delete(`/api/user/delete/${bookingId}`);
      setMessage({ type: "ok", text: "Бронь удалена" });
      load();
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  const totalBookings = offices.reduce(
    (sum, o) => sum + o.floors.reduce(
      (s, f) => s + f.rooms.reduce(
        (x, r) => x + (r.bookings?.length || 0), 0
      ), 0
    ), 0
  );

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <h2>Мои бронирования</h2>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        {totalBookings > 0
          ? `Активных: ${totalBookings}`
          : "Здесь будут отображаться ваши бронирования"}
      </p>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading && (
        <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>
          Загрузка...
        </div>
      )}

      {!loading && totalBookings === 0 && (
        <div className="card" style={{ textAlign: "center", color: "#6b7280", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ marginBottom: 4, color: "#374151", fontWeight: 500 }}>
            У вас пока нет бронирований
          </p>
          <p style={{ fontSize: 13 }}>
            Перейдите на вкладку «Комнаты», чтобы забронировать место
          </p>
        </div>
      )}

      {!loading && offices.map((office) => (
        <div key={office.id} style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>
            {office.city}
            <span style={{ color: "#9ca3af", fontWeight: 400, marginLeft: 8 }}>
              · {office.department}
            </span>
          </h3>

          {office.floors.map((floor) => (
            <div key={floor.id} style={{ marginBottom: 16 }}>
              <h4 style={{ color: "#4b5563", marginBottom: 8 }}>Этаж {floor.num}</h4>

              {floor.rooms.map((room) => (
                <div key={room.id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 12, fontSize: 15 }}>
                    <strong>Комната {room.number}</strong>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {room.bookings.map((b) => {
                      const upcoming = isUpcoming(b.endTime);
                      return (
                        <div
                          key={b.bookingId}
                          style={{
                            padding: 14,
                            background: "#f9fafb",
                            borderRadius: 6,
                            borderLeft: `3px solid ${upcoming ? "#2563eb" : "#9ca3af"}`,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                              <strong>{b.objectName}</strong>
                              <span style={{ color: "#9ca3af", fontSize: 13 }}>{b.spot}</span>
                              {typeBadge(b.type)}
                              {modeBadge(b.bookingMode)}
                              {!upcoming && (
                                <span style={{
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  background: "#f3f4f6",
                                  color: "#6b7280",
                                  fontSize: 11,
                                }}>
                                  завершено
                                </span>
                              )}
                            </div>
                            <div style={{ color: "#4b5563", fontSize: 13 }}>
                              {formatDateTime(b.startTime)} → {formatDateTime(b.endTime)}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteBooking(b.bookingId)}
                            style={{
                              padding: "6px 12px",
                              background: "#fee2e2",
                              color: "#991b1b",
                              border: "1px solid #fca5a5",
                              fontSize: 13,
                            }}
                          >
                            Удалить
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}