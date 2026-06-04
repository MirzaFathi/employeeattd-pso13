"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  NeuCard,
  NeuCardHeader,
  NeuCardTitle,
  NeuCardContent,
} from "@/components/ui/neu-card";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

/* ------------------------------------------------------------------ */
/*  Pure helpers (no side-effects)                                     */
/* ------------------------------------------------------------------ */

/** Days of the week header labels */
const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

/** Return total days in a given month (0-indexed month) */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Return 0-6 weekday index for the 1st of the month */
function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

/** Format YYYY-MM-DD from Date parts */
function toDateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Return Indonesian month name */
const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardCalendar() {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth()); // 0-indexed
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  /* ---------- Fetch holidays when year changes ---------- */
  React.useEffect(() => {
    let cancelled = false;

    async function fetchHolidays() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/holidays?year=${year}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = await res.json();
        if (!cancelled) {
          if (json.success && Array.isArray(json.data)) {
            setHolidays(json.data);
          } else {
            setHolidays([]);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError("Gagal memuat data hari libur");
          setHolidays([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchHolidays();
    return () => {
      cancelled = true;
    };
  }, [year, retryCount]);

  /* ---------- Build a quick lookup map date → holiday name(s) ---------- */
  const holidayMap = React.useMemo(() => {
    const map = new Map<string, string[]>();
    for (const h of holidays) {
      const existing = map.get(h.date);
      if (existing) {
        existing.push(h.name);
      } else {
        map.set(h.date, [h.name]);
      }
    }
    return map;
  }, [holidays]);

  /* ---------- Navigation ---------- */
  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  /* ---------- Calendar grid cells ---------- */
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Build cells: leading blanks + days
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  /* ---------- Upcoming holidays for the sidebar list ---------- */
  const upcomingHolidays = React.useMemo(() => {
    const currentMonthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    return holidays
      .filter((h) => h.date.startsWith(currentMonthStr))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, year, month]);

  /* ---------- Render ---------- */
  return (
    <NeuCard>
      <NeuCardHeader>
        <div className="flex items-center justify-between">
          <NeuCardTitle>
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--neu-danger)" }}
              />
              Kalender &amp; Hari Libur
            </span>
          </NeuCardTitle>

          {/* Nav controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={goToday}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150",
                "bg-[var(--neu-surface-light)] text-[var(--neu-text-secondary)]",
                "hover:text-[var(--neu-accent)] hover:bg-[var(--neu-surface)]",
                "border border-[var(--neu-border)]"
              )}
              aria-label="Kembali ke bulan ini"
            >
              Hari Ini
            </button>
            <button
              onClick={goPrev}
              className={cn(
                "p-1.5 rounded-md transition-colors duration-150",
                "text-[var(--neu-text-secondary)] hover:text-[var(--neu-accent)]",
                "hover:bg-[var(--neu-surface-light)]"
              )}
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              className={cn(
                "p-1.5 rounded-md transition-colors duration-150",
                "text-[var(--neu-text-secondary)] hover:text-[var(--neu-accent)]",
                "hover:bg-[var(--neu-surface-light)]"
              )}
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month / Year label */}
        <p className="mt-1 text-sm font-medium text-[var(--neu-text-secondary)]">
          {MONTH_NAMES_ID[month]} {year}
        </p>
      </NeuCardHeader>

      <NeuCardContent>
        {/* ---- Loading state ---- */}
        {loading && (
          <div className="flex items-center justify-center py-10 gap-3">
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--neu-accent)", borderTopColor: "transparent" }}
            />
            <span className="text-sm text-[var(--neu-text-muted)]">
              Memuat data libur…
            </span>
          </div>
        )}

        {/* ---- Error state ---- */}
        {!loading && error && (
          <div
            className="rounded-lg px-4 py-3 text-sm mb-4"
            style={{
              backgroundColor: "rgba(248, 113, 113, 0.08)",
              border: "1px solid rgba(248, 113, 113, 0.2)",
              color: "var(--neu-danger)",
            }}
          >
            <p>{error}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="mt-1 underline text-xs opacity-80 hover:opacity-100"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* ---- Calendar grid ---- */}
        {!loading && (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((wd, i) => (
                <div
                  key={wd}
                  className={cn(
                    "text-center text-[11px] font-semibold uppercase tracking-wider py-1.5",
                    i === 0 ? "text-[var(--neu-danger)]" : "text-[var(--neu-text-muted)]"
                  )}
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`blank-${idx}`} className="aspect-square" />;
                }

                const dateKey = toDateKey(year, month, day);
                const isToday = dateKey === todayKey;
                const holidayNames = holidayMap.get(dateKey);
                const isHoliday = !!holidayNames;
                const isSunday = new Date(year, month, day).getDay() === 0;

                return (
                  <div
                    key={dateKey}
                    className={cn(
                      "relative aspect-square flex flex-col items-center justify-center",
                      "rounded-lg transition-all duration-150 cursor-default group",
                      "hover:bg-[var(--neu-surface-light)]",
                      isToday && "ring-1 ring-[var(--neu-accent)] bg-[var(--neu-surface-light)]"
                    )}
                    title={isHoliday ? holidayNames.join(", ") : undefined}
                  >
                    {/* Day number */}
                    <span
                      className={cn(
                        "text-sm font-medium leading-none",
                        isToday && "text-[var(--neu-accent)] font-bold",
                        isHoliday && !isToday && "text-[var(--neu-danger)] font-semibold",
                        isSunday && !isHoliday && !isToday && "text-[var(--neu-danger)] opacity-60",
                        !isToday && !isHoliday && !isSunday && "text-[var(--neu-text)]"
                      )}
                    >
                      {day}
                    </span>

                    {/* Holiday dot indicator */}
                    {isHoliday && (
                      <span
                        className="absolute bottom-[6px] w-[5px] h-[5px] rounded-full"
                        style={{
                          backgroundColor: "var(--neu-danger)",
                          boxShadow: "0 0 4px rgba(248, 113, 113, 0.6)",
                        }}
                      />
                    )}

                    {/* Tooltip on hover */}
                    {isHoliday && (
                      <div
                        className={cn(
                          "absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2",
                          "px-3 py-1.5 rounded-lg text-[11px] leading-tight font-medium",
                          "whitespace-nowrap pointer-events-none",
                          "opacity-0 group-hover:opacity-100",
                          "transition-opacity duration-200",
                          "shadow-lg"
                        )}
                        style={{
                          backgroundColor: "var(--neu-surface)",
                          border: "1px solid var(--neu-border)",
                          color: "var(--neu-danger)",
                        }}
                      >
                        {holidayNames.join(", ")}
                        {/* Tooltip arrow */}
                        <span
                          className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]"
                          style={{
                            width: 0,
                            height: 0,
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: "5px solid var(--neu-surface)",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ---- Upcoming holidays list for this month ---- */}
            {upcomingHolidays.length > 0 && (
              <div
                className="mt-4 pt-4"
                style={{ borderTop: "1px solid var(--neu-border)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--neu-text-muted)] mb-2">
                  Hari Libur Bulan Ini
                </p>
                <ul className="space-y-1.5">
                  {upcomingHolidays.map((h, i) => {
                    const d = new Date(h.date + "T00:00:00");
                    const dayNum = d.getDate();
                    const dayName = d.toLocaleDateString("id-ID", { weekday: "short" });
                    return (
                      <li key={`${h.date}-${i}`} className="flex items-start gap-2 text-sm">
                        <span
                          className="mt-[5px] inline-block w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: "var(--neu-danger)" }}
                        />
                        <span className="text-[var(--neu-text-secondary)]">
                          <span className="font-semibold text-[var(--neu-text)]">
                            {dayNum} {dayName}
                          </span>
                          {" — "}
                          {h.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </>
        )}
      </NeuCardContent>
    </NeuCard>
  );
}
