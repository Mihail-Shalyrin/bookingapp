import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

export default function AdminUserBookingsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    date: "",
    office: "",
    floor: "",
    type: "",
  });

  useEffect(() => {
    load();
  }, [userId]);

  async function load(activeFilters = {}) {
    setLoading(true);
    setMessage(null);
    try {
      const params = {};
      if (activeFilters.date) params.date = activeFilters.date;
      if (activeFilters.office) params.office = activeFilters.office;
      if (activeFilters.floor) params.floor = activeFilters.floor;
      if (activeFilters.type) params.type = activeFilters.type;

      const { data } = await api.get(
        `/api/admin/users/${userId}/bookings`,
        { params }
      );
      setOffices(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  function applyFilters(e) {
    e.preventDefault();
    load(filters);
  }

  function resetFilters() {
    setFilters({ date: "", office: "", floor: "", type: "" });
    load();
  }

  function onFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  async function deleteBooking(bookingId, objectName) {
    if (!confirm(`Удалить бронь "${objectName}"?`)) return;

    try {
      await api.delete(`/api/admin/bookings/${bookingId}`);
      setMessage({ type: "ok", text: "Бронь удалена" });
      load(filters);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
        <button onClick={() => navigate("/admin/employees")}>
          ← К списку сотрудников
        </button>
        <button onClick={() => navigate(`/admin/employees/${userId}/bookings/available`)}>
          Создать бронь
        </button>
      </div>

      <h2>Брони сотрудника</h2>
      <p style={{ color: "#666", marginBottom: 16 }}>
        По умолчанию показаны все брони. Выберите дату, чтобы посмотреть конкретный день.
      </p>

      <form
        onSubmit={applyFilters}
        style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
      >
        <input
          type="date"
          name="date"
          value={filters.date}
          onChange={onFilterChange}
        />
        <input
          placeholder="Офис (город)"
          name="office"
          value={filters.office}
          onChange={onFilterChange}
        />
        <input
          placeholder="Этаж"
          name="floor"
          type="number"
          value={filters.floor}
          onChange={onFilterChange}
        />
        <select name="type" value={filters.type} onChange={onFilterChange}>
          <option value="">Любой тип</option>
          <option value="ROOM">Стол</option>
          <option value="MEETING">Переговорка</option>
          <option value="HALL">Холл</option>
        </select>
        <button type="submit">Применить</button>
        <button type="button" onClick={resetFilters}>Сбросить</button>
      </form>

      {message && (
        <div style={{
          padding: 8, marginBottom: 12,
          background: message.type === "ok" ? "#d1fae5" : "#fee2e2",
          color: message.type === "ok" ? "#065f46" : "#991b1b",
          borderRadius: 4,
        }}>
          {message.text}
        </div>
      )}

      {loading && <div>Загрузка...</div>}

      {!loading && offices.length === 0 && (
        <p style={{ color: "gray" }}>Броней нет.</p>
      )}

      {!loading && offices.map((office) => (
        <div key={office.id} style={{ marginBottom: 24 }}>
          <h3>{office.city} — {office.department}</h3>

          {office.floors.map((floor) => (
            <div key={floor.id} style={{ marginLeft: 16, marginBottom: 12 }}>
              <h4>Этаж {floor.num}</h4>

              {floor.rooms.map((room) => (
                <div key={room.id} style={{ marginLeft: 16, marginBottom: 8 }}>
                  <strong>Комната {room.number}</strong>

                  <ul style={{ listStyle: "none", padding: 0, marginTop: 8 }}>
                    {room.objects.map((obj) => (
                      <li
                        key={obj.id}
                        style={{
                          padding: 8,
                          border: "1px solid #e5e7eb",
                          borderRadius: 4,
                          marginBottom: 6,
                        }}
                      >
                        <div style={{ marginBottom: 6 }}>
                          <strong>{obj.name}</strong> ({obj.spot}) — {obj.type}
                        </div>
                        {obj.bookings?.length > 0 && (
                          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {obj.bookings.map((b) => (
                              <li
                                key={b.bookingId}
                                style={{
                                  padding: 6,
                                  background: "#f9fafb",
                                  borderRadius: 4,
                                  marginBottom: 4,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div style={{ fontSize: 13 }}>
                                  {b.startTime.slice(0, 16).replace("T", " ")} — {b.endTime.slice(0, 16).replace("T", " ")}
                                  {b.bookingMode && (
                                    <span style={{ color: "#888", marginLeft: 8 }}>
                                      ({b.bookingMode === "WEEKLY" ? "еженедельная" : "разовая"})
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => deleteBooking(b.bookingId, obj.name)}
                                  style={{
                                    padding: "4px 10px",
                                    background: "#fee2e2",
                                    color: "#991b1b",
                                    border: "1px solid #fca5a5",
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    fontSize: 12,
                                  }}
                                >
                                  Удалить
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}