import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  isSameDay,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar as CalendarIcon } from "lucide-react";

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  activities: Record<string, Activity>;
}

interface Activity {
  description: string;
  hours: number;
}

export function Calendar({
  selectedDate,
  onDateSelect,
  activities,
}: CalendarProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6" />
          {format(selectedDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="text-center font-medium text-gray-600 dark:text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isWeekendDay = isWeekend(day);
          const hasActivity = activities[format(day, "yyyy-MM-dd")];

          return (
            <button
              key={day.toString()}
              onClick={() => onDateSelect(day)}
              className={`
                p-3 rounded-lg text-sm relative
                ${isWeekendDay ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-blue-50 dark:hover:bg-blue-900"}
                ${isSameDay(day, selectedDate) ? "bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700" : ""}
                ${hasActivity ? "border-2 border-blue-400 dark:border-blue-500" : ""}
                ${isWeekendDay ? "text-gray-500 dark:text-gray-400" : "text-gray-700 dark:text-gray-200"}
              `}
            >
              <span>{format(day, "d")}</span>
              {hasActivity && (
                <div className="absolute bottom-1 right-1">
                  <Clock className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
