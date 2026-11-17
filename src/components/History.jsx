import { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const DAY_MS = 86400000;
const RANGES = [7, 30, 90];
const dayLabel = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

export function buildSeries(history, days = 30) {
  const counts = new Map();
  for (const entry of history || []) {
    counts.set(entry.day, (counts.get(entry.day) || 0) + (Number(entry.clicks) || 0));
  }
  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const series = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(todayUtc - offset * DAY_MS);
    const key = dayKey(date);
    series.push({ key, date, clicks: counts.get(key) || 0 });
  }
  return series;
}

export function Sparkline({ history, days = 14 }) {
  const series = useMemo(() => buildSeries(history, days), [history, days]);
  const max = Math.max(1, ...series.map((day) => day.clicks));
  return (
    <span className="spark" aria-hidden="true">
      {series.map((day, index) => (
        <span
          key={day.key}
          className="spark-bar"
          data-zero={day.clicks === 0 ? "true" : "false"}
          style={{ height: `${Math.max(10, (day.clicks / max) * 100)}%`, animationDelay: `${index * 18}ms` }}
        />
      ))}
    </span>
  );
}

export function HistoryChart({ history, days = 30 }) {
  const series = useMemo(() => buildSeries(history, days), [history, days]);
  const max = Math.max(1, ...series.map((day) => day.clicks));
  const span = Math.max(1, series.length - 1);

  return (
    <div className="chart">
      <div
        className={`chart-plot${days > 30 ? " chart-plot--dense" : ""}`}
        role="img"
        aria-label={`Clics de los últimos ${days} días`}
      >
        {series.map((day, index) => (
          <div
            className="chart-col"
            key={day.key}
            title={`${dayLabel.format(day.date)}: ${day.clicks} ${day.clicks === 1 ? "clic" : "clics"}`}
          >
            <div
              className="chart-bar"
              data-zero={day.clicks === 0 ? "true" : "false"}
              style={{
                height: day.clicks === 0 ? undefined : `${Math.max(4, (day.clicks / max) * 100)}%`,
                animationDelay: `${Math.round((index / span) * 420)}ms`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="chart-axis">
        <span>{dayLabel.format(series[0].date)}</span>
        <span>{max} clics máx.</span>
        <span>hoy</span>
      </div>
    </div>
  );
}

function uniques(count) {
  const value = Math.round(count || 0);
  return `${value} ${value === 1 ? "único" : "únicos"}`;
}

export function HistoryModal({ link, onClose }) {
  const [range, setRange] = useState(30);
  const [series, setSeries] = useState(null);
  const [loadedRange, setLoadedRange] = useState(null);
  const [total, setTotal] = useState(0);
  const [unique, setUnique] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    api
      .history(link.id, range)
      .then((data) => {
        if (!alive) return;
        setSeries(data.series || []);
        setLoadedRange(data.days || range);
        setTotal(Number(data.total) || 0);
        setUnique(Number(data.unique) || 0);
      })
      .catch(() => {
        if (!alive) return;
        setSeries(null);
        setLoadedRange(null);
        setTotal(0);
        setUnique(0);
        setError("No hemos podido cargar el histórico de este enlace.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [link.id, range]);

  const filled = useMemo(() => (series ? buildSeries(series, loadedRange || range) : null), [series, loadedRange, range]);
  const best = filled ? filled.reduce((top, day) => (day.clicks > top.clicks ? day : top), filled[0]) : null;
  const activeDays = filled ? filled.filter((day) => day.clicks > 0).length : 0;
  const shownRange = loadedRange || range;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal modal-history"
        role="dialog"
        aria-modal="true"
        aria-label={`Histórico de clics de ${link.shortUrl}`}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
        <p className="modal-eyebrow">Histórico de clics</p>
        <h3 className="modal-title">/{link.slug}</h3>

        <div className="history-summary">
          <div className="history-stat">
            <span>Total</span>
            <strong>{link.clicks}</strong>
            <em>clics · {uniques(link.uniqueClicks)}</em>
          </div>
          <div className="history-stat">
            <span>En el rango</span>
            <strong>{series ? total : "—"}</strong>
            <em>{shownRange} días · {uniques(unique)}</em>
          </div>
          <div className="history-stat">
            <span>Mejor día</span>
            <strong>{best ? best.clicks : "—"}</strong>
            <em>{best && best.clicks ? dayLabel.format(best.date) : "sin datos"}</em>
          </div>
        </div>

        <div className="range-switch" role="group" aria-label="Rango del histórico">
          {RANGES.map((value) => (
            <button
              key={value}
              type="button"
              className={`range-btn${range === value ? " is-active" : ""}`}
              aria-pressed={range === value}
              onClick={() => setRange(value)}
            >
              {value} días
            </button>
          ))}
        </div>

        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : filled ? (
          <div className={`chart-wrap${loading ? " is-loading" : ""}`}>
            <HistoryChart history={series} days={shownRange} />
          </div>
        ) : (
          <div className="chart-skeleton" aria-hidden="true">
            <span className="skeleton" />
          </div>
        )}

        <p className="chart-note">
          Clics por día en UTC, últimos {shownRange} días · {uniques(unique)} · {activeDays}{" "}
          {activeDays === 1 ? "día con visitas" : "días con visitas"}
        </p>

        <div className="modal-actions">
          <a className="btn btn-ghost btn-sm" href={link.shortUrl} target="_blank" rel="noreferrer">
            Abrir enlace
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
