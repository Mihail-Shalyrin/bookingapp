import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";
import { typeBadge } from "../../utils/badges";

const WORK_START = 9 * 60;
const WORK_END = 18 * 60;

function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function AdminUserBookingAvailablePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [date, setDate] = useState(today);
  const [startMinutes, setStartMinutes] = useState(WORK_START);
  const [endMinutes, setEndMinutes] = useState(WORK_START + 60);
  const [filters, setFilters] = useState({ office: "", floor: "", type: "" });

  // загрузим при первом открытии с дефолтными значениями
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function load() {
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

      const { data } = await api.get(
        `/api/admin/users/${userId}/available-rooms`,
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
    load();
  }

  function resetFilters() {
    setDate(today);
    setStartMinutes(WORK_START);
    setEndMinutes(WORK_START + 60);
    setFilters({ office: "", floor: "", type: "" });
    setMessage(null);
  }

  function onFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <button
        onClick={() => navigate(`/admin/employees/${userId}/bookings`)}
        style={{ marginBottom: 16 }}
      >
        ← К броням сотрудника
      </button>

      <h2>Выберите место для бронирования</h2>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        Показаны места, доступные этому сотруднику на выбранный интервал.
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

      {loading && (
        <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>
          Загрузка...
        </div>
      )}

      {!loading && offices.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "#6b7280", padding: 32 }}>
          Доступных мест нет
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
                  <strong style={{ fontSize: 15 }}>Комната {room.number}</strong>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
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
                                  {b.startTime.slice(11, 16)}–{b.endTime.slice(11, 16)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          onClick={() =>
                            navigate(`/admin/employees/${userId}/bookings/book/${obj.id}`)
                          }
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