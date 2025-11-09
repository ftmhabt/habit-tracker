import type { HabitWithProgress } from "@/types/habits";
import HabitPin from "./HabitPin";

interface HabitGridProps {
  habits: HabitWithProgress[];
  days: string[];
  todayISO: string;
  onToggle: (habitId: string, date: string) => void;
  todayRef?: React.RefObject<HTMLDivElement | null>;
}

export default function HabitGrid({
  habits,
  days,
  todayISO,
  onToggle,
  todayRef,
}: HabitGridProps) {
  return (
    <div className="min-w-max">
      {/* Header days */}
      <div className="flex border-b border-muted bg-muted/40">
        {days.map((d) => {
          const isToday = d === todayISO;
          return (
            <div
              key={d}
              className={`w-16 text-center py-2 font-medium border-r border-muted text-xs sm:text-sm ${
                isToday
                  ? "bg-primary/20 text-primary font-semibold rounded-sm border-primary"
                  : ""
              }`}
            >
              {d.slice(5)}
            </div>
          );
        })}
      </div>

      {/* Habit rows */}
      {habits.map((habit) => (
        <div key={habit.id} className="flex">
          {days.map((date) => {
            const done = habit.progress?.[date];
            const isToday = date === todayISO;
            return (
              <div
                key={`${habit.id}-${date}`}
                ref={isToday ? todayRef : null}
                onClick={isToday ? () => onToggle(habit.id, date) : undefined}
                className={`w-16 h-9 border-r border-b border-muted flex items-center justify-center select-none ${
                  isToday
                    ? "cursor-pointer active:scale-95 transition"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <HabitPin
                  shape={habit.visual?.shape || "circle"}
                  done={!!done}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
