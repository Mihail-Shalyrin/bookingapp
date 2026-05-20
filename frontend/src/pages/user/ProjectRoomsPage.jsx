import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

export default function ProjectRoomsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    office: "",
    floor: "",
    type: "",
  });

  useEffect(() => {
    load();
  }, [projectId]);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.get(`/api/projects/${projectId}/rooms`);
      setOffices(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  async function applyFilters(e) {
    e.preventDefault();
    setMessage(null);

    if (!filters.start || !filters.end) {
      setMessage({ type: "err", text: "Укажите начало и конец периода" });
      return;
    }
    if (filters.end <= filters.start) {
      setMessage({ type: "err", text: "Конец должен быть позже начала" });
      return;
    }

    setLoading(true);
    try {
      const params = {
        start: filters.start,
        end: filters.end,
      };
      if (filters.office) params.office = filters.office;
      if (filters.floor) params.floor = filters.floor;
      if (filters.type) params.type = filters.type;

      const { data } = await api.get(
        `/api/projects/${projectId}/rooms/filter`,
        { params }
      );
      setOffices(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setFilters({ start: "", end: "", office: "", floor: "", type: "" });
    setMessage(null);
    load();
  }

  function onFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div style={{ padding: 24 }}>
      {/* <button onClick={() => navigate("/my-projects")} style={{ marginBottom: 16 }}>
        ← К списку проектов
      </button> */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
  <button onClick={() => navigate("/my-projects")}>
    ← К списку проектов
  </button>
  <button onClick={() => navigate(`/projects/${projectId}/members`)}>
    Участники проекта
  </button>
</div>

      <h2>Места проекта</h2>

      <form
        onSubmit={applyFilters}
        style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}
      >
        <input
          type="datetime-local"
          name="start"
          value={filters.start}
          onChange={onFilterChange}
          required
        />
        <input
          type="datetime-local"
          name="end"
          value={filters.end}
          onChange={onFilterChange}
          required
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
          background: "#fee2e2", color: "#991b1b", borderRadius: 4,
        }}>
          {message.text}
        </div>
      )}

      {loading && <div>Загрузка...</div>}

      {!loading && offices.length === 0 && (
        <p style={{ color: "gray" }}>У этого проекта нет зарезервированных мест.</p>
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
                  {room.load && (
                    <span style={{ marginLeft: 8, color: "#666" }}>
                      нагрузка: {room.load}
                    </span>
                  )}

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
                          {obj.bookings?.length > 0 && (
                            <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                              Занято:{" "}
                              {obj.bookings
                                .map(b =>
                                  `${b.username} (${b.startTime.slice(11, 16)}–${b.endTime.slice(11, 16)})`
                                )
                                .join(", ")}
                            </div>
                          )}
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