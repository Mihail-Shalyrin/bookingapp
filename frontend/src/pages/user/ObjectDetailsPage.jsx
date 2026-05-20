import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getErrorText } from "../../utils/errors";

const WORK_START = 9 * 60;
const WORK_END = 18 * 60;

function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function ObjectDetailsPage() {
  const { objectId } = useParams();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [objectInfo, setObjectInfo] = useState(null);
  const [date, setDate] = useState(today);
  const [startMinutes, setStartMinutes] = useState(WORK_START);
  const [duration, setDuration] = useState(null);
  const [bookingMode, setBookingMode] = useState("ONE_TIME");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadObject();
  }, [objectId, date]);

  async function loadObject() {
    try {
      const { data } = await api.get(`/api/main/rooms/${objectId}`, {
        params: { date },
      });
      setObjectInfo(data);
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  const obj = objectInfo?.[0]?.floors?.[0]?.rooms?.[0]?.objects?.[0];
  const room = objectInfo?.[0]?.floors?.[0]?.rooms?.[0];
  const floor = objectInfo?.[0]?.floors?.[0];
  const office = objectInfo?.[0];

  const durationOptions = getDurationOptions(obj?.type);

  function buildTimes() {
    if (obj?.type === "HALL") {
      return {
        startTime: `${date}T00:00:00`,
        endTime: `${date}T23:59:59`,
      };
    }

    const startStr = minutesToTime(startMinutes);
    const start = `${date}T${startStr}:00`;
    let end;

    if (duration === "WORKDAY_END") {
      end = `${date}T18:00:00`;
    } else {
      const endMinutes = startMinutes + duration;
      const endStr = minutesToTime(endMinutes);
      end = `${date}T${endStr}:00`;
    }

    return { startTime: start, endTime: end };
  }

  async function onBook(e) {
    e.preventDefault();
    setMessage(null);

    if (obj?.type !== "HALL" && duration === null) {
      setMessage({ type: "err", text: "Выберите длительность" });
      return;
    }

    const { startTime: st, endTime: et } = buildTimes();

    try {
      await api.post("/api/bookings", {
        objectId: Number(objectId),
        startTime: st,
        endTime: et,
        bookingMode: bookingMode,
      });
      navigate("/rooms");
    } catch (err) {
      setMessage({ type: "err", text: getErrorText(err) });
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <button onClick={() => navigate(-1)}>← Назад</button>

      {!obj && <div>Загрузка...</div>}

      {obj && (
        <>
          <h2>{obj.name} ({obj.spot})</h2>
          <p>
            Офис: {office.city} / Этаж: {floor.num} / Комната: {room.number}
            <br />
            Тип: {obj.type}
          </p>

          <div style={{ marginBottom: 16 }}>
            <label>Дата: </label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <h3>Брони на {date}:</h3>
          {obj.bookings?.length === 0 ? (
            <p style={{ color: "green" }}>Свободно весь день</p>
          ) : (
            <ul>
              {obj.bookings.map((b) => (
                <li key={b.bookingId}>
                  {b.username}: {b.startTime.slice(11, 16)} — {b.endTime.slice(11, 16)}
                </li>
              ))}
            </ul>
          )}

          <h3>Забронировать</h3>

          {obj.type === "HALL" ? (
            <p>Холл бронируется на весь день (00:00 — 23:59).</p>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <label>
                  Начало: <strong>{minutesToTime(startMinutes)}</strong>
                </label>
                <input
                  type="range"
                  min={WORK_START}
                  max={WORK_END - 30}
                  step={15}
                  value={startMinutes}
                  onChange={(e) => setStartMinutes(Number(e.target.value))}
                  style={{ width: "100%", display: "block", marginTop: 8 }}
                />
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  color: "#888",
                  marginTop: 4,
                }}>
                  <span>09:00</span>
                  <span>18:00</span>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label>Длительность:</label>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDuration(opt.value)}
                      style={{
                        padding: "6px 12px",
                        border: duration === opt.value ? "2px solid #2563eb" : "1px solid #ccc",
                        background: duration === opt.value ? "#dbeafe" : "white",
                        cursor: "pointer",
                        borderRadius: 4,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: 12 }}>
            <label>Режим: </label>
            <select
              value={bookingMode}
              onChange={(e) => setBookingMode(e.target.value)}
            >
              <option value="ONE_TIME">Разовая</option>
              <option value="WEEKLY">Еженедельная (2 недели)</option>
            </select>
          </div>

          <button onClick={onBook} style={{ padding: "8px 16px" }}>
            Создать бронь
          </button>

          {message && (
            <div style={{ marginTop: 12, color: message.type === "ok" ? "green" : "red" }}>
              {message.text}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getDurationOptions(type) {
  if (type === "ROOM") {
    return [
      { value: 60, label: "1 час" },
      { value: 120, label: "2 часа" },
      { value: "WORKDAY_END", label: "До конца дня" },
    ];
  }
  if (type === "MEETING") {
    return [
      { value: 30, label: "30 минут" },
      { value: 60, label: "1 час" },
      { value: 90, label: "1.5 часа" },
      { value: "WORKDAY_END", label: "До конца дня" },
    ];
  }
  return [];
}