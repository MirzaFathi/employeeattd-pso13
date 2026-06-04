"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { NeuCard, NeuCardHeader, NeuCardTitle, NeuCardContent, NeuCardDescription } from "@/components/ui/neu-card";
import { NeuButton } from "@/components/ui/neu-button";
import { NeuBadge } from "@/components/ui/neu-badge";
import { NeuSelect } from "@/components/ui/neu-select";
import { NeuToast } from "@/components/ui/neu-toast";

interface Holiday {
  date: string;
  name: string;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function HolidaysPage() {
  const currentYearNum = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNum);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchHolidays = async (year: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/holidays?year=${year}`);
      const result = await response.json();
      if (result.success) {
        setHolidays(result.data);
      } else {
        setToast({ message: result.error || "Gagal mengambil data hari libur", type: "error" });
      }
    } catch (err: any) {
      setToast({ message: "Gagal memuat hari libur. Periksa konfigurasi API Anda.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays(selectedYear);
  }, [selectedYear]);

  // Helper to format date string to YYYY-MM-DD
  const formatDateString = (year: number, monthIndex: number, day: number) => {
    const mm = String(monthIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Helper to check if a date is a holiday and return the holiday object
  const getHolidayForDate = (dateStr: string) => {
    return holidays.find(h => h.date === dateStr);
  };

  const yearsOptions = [
    { value: String(currentYearNum - 1), label: String(currentYearNum - 1) },
    { value: String(currentYearNum), label: String(currentYearNum) },
    { value: String(currentYearNum + 1), label: String(currentYearNum + 1) },
    { value: String(currentYearNum + 2), label: String(currentYearNum + 2) }
  ];

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value, 10));
  };

  // Generate days array for a month
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <NeuToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--neu-text)] flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-red-500" />
            Hari Libur Nasional Indonesia
          </h1>
          <p className="text-[var(--neu-text-secondary)]">
            Mengambil data resmi hari libur nasional & cuti bersama dari Google Calendar API.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32">
            <NeuSelect
              options={yearsOptions}
              value={String(selectedYear)}
              onChange={handleYearChange}
            />
          </div>
          <NeuButton
            onClick={() => fetchHolidays(selectedYear)}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </NeuButton>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--neu-accent)]" />
          <p className="text-[var(--neu-text-secondary)] animate-pulse">Menarik data dari Google Calendar...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Grid Calendar View */}
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MONTH_NAMES.map((monthName, monthIdx) => {
                const days = getDaysInMonth(selectedYear, monthIdx);
                return (
                  <NeuCard key={monthName} className="p-4">
                    <h3 className="font-semibold text-center mb-3 text-[var(--neu-text)]">
                      {monthName} {selectedYear}
                    </h3>
                    
                    {/* Weekday labels */}
                    <div className="grid grid-cols-7 text-center text-xs font-semibold text-[var(--neu-text-secondary)] mb-2">
                      {WEEKDAYS.map((day, idx) => (
                        <div key={idx} className={idx === 0 ? "text-red-500" : ""}>
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 text-center gap-1 text-sm">
                      {days.map((day, idx) => {
                        if (day === null) {
                          return <div key={`empty-${idx}`} />;
                        }

                        const dateStr = formatDateString(selectedYear, monthIdx, day);
                        const holiday = getHolidayForDate(dateStr);
                        const isSunday = idx % 7 === 0;

                        return (
                          <div
                            key={day}
                            title={holiday?.name}
                            className={`
                              relative p-2 rounded-lg font-medium transition-all cursor-default
                              ${holiday 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20 font-bold' 
                                : isSunday 
                                  ? 'text-red-500 hover:bg-white/5' 
                                  : 'text-[var(--neu-text)] hover:bg-white/5'
                              }
                            `}
                          >
                            {day}
                            {holiday && (
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </NeuCard>
                );
              })}
            </div>
          </div>

          {/* Sidebar List of Holidays */}
          <div className="space-y-6">
            <NeuCard className="h-full max-h-[85vh] flex flex-col">
              <NeuCardHeader>
                <NeuCardTitle>Daftar Hari Libur ({holidays.length})</NeuCardTitle>
                <NeuCardDescription>
                  Daftar tanggal merah pada tahun {selectedYear}.
                </NeuCardDescription>
              </NeuCardHeader>
              <NeuCardContent className="overflow-y-auto pr-2 space-y-3 flex-1 max-h-[60vh] xl:max-h-[70vh]">
                {holidays.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--neu-text-secondary)]">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <p>Tidak ada hari libur nasional ditemukan pada tahun ini.</p>
                  </div>
                ) : (
                  holidays.map((holiday, idx) => {
                    const dateObj = new Date(holiday.date);
                    const formattedDate = dateObj.toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    });
                    
                    return (
                      <div 
                        key={idx} 
                        className="p-3 bg-[var(--neu-bg)] border border-[var(--neu-border)] rounded-lg hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-[var(--neu-text-secondary)]">
                            {formattedDate}
                          </span>
                          <NeuBadge variant="error" className="text-[10px]">
                            Hari Libur
                          </NeuBadge>
                        </div>
                        <h4 className="font-semibold text-sm text-[var(--neu-text)]">
                          {holiday.name}
                        </h4>
                      </div>
                    );
                  })
                )}
              </NeuCardContent>
            </NeuCard>
          </div>
        </div>
      )}
    </div>
  );
}
