import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

const WORK_START = 9 * 60;
const WORK_END = 18 * 60;

function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function loadBadge(load) {
  const config = {
    LOW: { bg: "#d1fae5", color: "#065f46", label: "Низкая нагрузка" },
    MEDIUM: { bg: "#fef3c7", color: "#92400e", label: "Средняя нагрузка" },
    HIGH: { bg: "#fee2e2", color: "#991b1b", label: "Высокая нагрузка" },
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

export default function RoomsPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const [date, setDate] = useState("");
  const [startMinutes, setStartMinutes] = useState(WORK_START);
  const [endMinutes, setEndMinutes] = useState(WORK_START + 60);
  const [filters, setFilters] = useState({ office: "", floor: "", type: "" });

  const navigate = useNavigate();

  useEffect(() => { loadRooms(); }, []);

  async function loadRooms() {
    setLoading(true);
    setMessage(null);
    try {
      const { data } = await api.get("/api/main/rooms");
      setOffices(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  function onStartChange(value) {
    const v = Number(value);
    setStartMinutes(v);
    if (v >= endMinutes) setEndMinutes(Math.min(v + 15, WORK_END));
  }

  function onEndChange(value) {
    const v = Number(value);
    setEndMinutes(v);
    if (v <= startMinutes) setStartMinutes(Math.max(v - 15, WORK_START));
  }

  async function applyFilters(e) {
    e.preventDefault();
    setMessage(null);
    if (!date) {
      setMessage({ type: "err", text: "Выберите дату" });
      return;
    }

    setLoading(true);
    try {
      const start = `${date}T${minutesToTime(startMinutes)}:00`;
      const end = `${date}T${minutesToTime(endMinutes)}:00`;
      const params = { start, end };
      if (filters.office) params.office = filters.office;
      if (filters.floor) params.floor = filters.floor;
      if (filters.type) params.type = filters.type;

      const { data } = await api.get("/api/main/rooms/filter", { params });
      setOffices(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setDate("");
    setStartMinutes(WORK_START);
    setEndMinutes(WORK_START + 60);
    setFilters({ office: "", floor: "", type: "" });
    setMessage(null);
    loadRooms();
  }

  function onFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h2>Доступные места</h2>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        Выберите место, чтобы забронировать его на нужное время.
      </p>

      <form onSubmit={applyFilters} className="card" style={{
        marginBottom: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
              Дата
            </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
              Офис
            </label>
            <input
              placeholder="Город"
              name="office"
              value={filters.office}
              onChange={onFilterChange}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
              Этаж
            </label>
            <input
              type="number"
              name="floor"
              value={filters.floor}
              onChange={onFilterChange}
              style={{ width: "100%" }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: 4, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
              Тип
            </label>
            <select name="type" value={filters.type} onChange={onFilterChange} style={{ width: "100%" }}>
              <option value="">Любой</option>
              <option value="ROOM">Стол</option>
              <option value="MEETING">Переговорка</option>
              <option value="HALL">Холл</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
              Начало: <strong style={{ color: "#1f2937", fontSize: 14 }}>{minutesToTime(startMinutes)}</strong>
            </label>
            <input
              type="range"
              min={WORK_START}
              max={WORK_END - 15}
              step={15}
              value={startMinutes}
              onChange={(e) => onStartChange(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 12, color: "#6b7280", fontWeight: 500 }}>
              Конец: <strong style={{ color: "#1f2937", fontSize: 14 }}>{minutesToTime(endMinutes)}</strong>
            </label>
            <input
              type="range"
              min={WORK_START + 15}
              max={WORK_END}
              step={15}
              value={endMinutes}
              onChange={(e) => onEndChange(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit">Применить</button>
          <button type="button" onClick={resetFilters}>Сбросить</button>
        </div>
      </form>

      {message && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {loading && <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>Загрузка...</div>}

      {!loading && offices.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "#6b7280", padding: 32 }}>
          Ничего не найдено
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
<h4 style={{ color: "#4b5563", marginBottom: 8, display: "flex", alignItems: "center" }}>
  Этаж {floor.num}
  {floor.load && loadBadge(floor.load)}
</h4>
              {floor.rooms.map((room) => (
                <div key={room.id} className="card" style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                    <strong style={{ fontSize: 15 }}>Комната {room.number}</strong>
                    {room.load && loadBadge(room.load)}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {room.objects.map((obj) => (
                      <div
                        key={obj.id}
                        style={{
                          padding: 12,
                          background: "#f9fafb",
                          borderRadius: 6,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <strong>{obj.name}</strong>
                            <span style={{ color: "#9ca3af", fontSize: 13 }}>{obj.spot}</span>
                            {typeBadge(obj.type)}
                          </div>
                          {obj.bookings?.length > 0 && (
                            <div style={{ color: "#6b7280", fontSize: 12 }}>
                              Занято:{" "}
                              {obj.bookings.map((b, i) => (
                                <span key={b.bookingId}>
                                  {i > 0 && ", "}
                                  <strong>{b.username}</strong> ({b.startTime.slice(11, 16)}–{b.endTime.slice(11, 16)})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          onClick={() => navigate(`/objects/${obj.id}`)}
                        >
                          Забронировать
                        </button>
                      </div>
                    ))}
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