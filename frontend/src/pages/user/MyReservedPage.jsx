import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

export default function MyReservedPage() {
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    office: "",
    floor: "",
    type: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load(activeFilters = {}) {
    setLoading(true);
    setMessage(null);
    try {
      const params = {};
      if (activeFilters.office) params.office = activeFilters.office;
      if (activeFilters.floor) params.floor = activeFilters.floor;
      if (activeFilters.type) params.type = activeFilters.type;

      const { data } = await api.get("/api/reservations/me", { params });
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
    setFilters({ office: "", floor: "", type: "" });
    load();
  }

  function onFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Мои резервы</h2>

      <p style={{ color: "#666", marginBottom: 16 }}>
        Места, закреплённые за вами. Только вы можете их бронировать.
      </p>

      <form
        onSubmit={applyFilters}
        style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
      >
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
          background: "#fee2e2", color: "#991b1b", borderRadius: 4,
        }}>
          {message.text}
        </div>
      )}

      {loading && <div>Загрузка...</div>}

      {!loading && offices.length === 0 && (
        <p style={{ color: "gray" }}>За вами не закреплено ни одного места.</p>
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
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div>
                            <strong>{obj.name}</strong> ({obj.spot}) — {obj.type}
                          </div>
                          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                            закреплено за вами
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/objects/${obj.id}`)}
                          style={{ padding: "6px 12px", cursor: "pointer" }}
                        >
                          Забронировать
                        </button>
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