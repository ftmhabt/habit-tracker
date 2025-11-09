"use client";

import { useHabitDays } from "@/hooks/habits/useHabitDays";
import { useHabitProgress } from "@/hooks/habits/useHabitProgress";
import { useUiFeedback } from "@/hooks/useUiFeedback";
import { HabitWithProgress } from "@/types/habits";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import HabitAddDialog from "./HabitAddDialog";
import HabitGrid from "./HabitGrid";
import HabitListDnd from "./HabitListDnd";

export default function HabitTable({
  habits,
}: {
  habits: HabitWithProgress[];
}) {
  const [localHabits, setLocalHabits] = useState(habits);

  const { days, todayISO, scrollRef, todayRef, handleScroll, scrollToToday } =
    useHabitDays();
  const { isPending, toggleProgress } = useHabitProgress({
    onUpdate: setLocalHabits,
    onError: () => alert("You can only update today's progress."),
  });
  const { isLoading, wrapAsync } = useUiFeedback();

  useEffect(() => {
    setLocalHabits(habits);
  }, [habits]);

  const handleToggle = (habitId: string, date: string) => {
    wrapAsync(async () => {
      toggleProgress(localHabits, habitId, date);
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-3">
        <h2 className="font-semibold text-lg">Habits</h2>
        <button
          onClick={scrollToToday}
          className="px-3 py-1.5 text-sm bg-primary text-white rounded-md shadow hover:bg-primary/90 transition"
        >
          Today
        </button>
      </div>

      {/* Table */}
      <div className="flex border border-muted rounded-xl bg-background/80 shadow-sm overflow-hidden">
        {/* Habit column */}
        <div className="min-w-[120px] border-r border-muted bg-muted/30">
          <div className="sticky top-0 px-3 py-2 font-semibold border-b border-muted bg-muted/40 text-sm">
            Habit
          </div>

          <HabitListDnd
            habits={localHabits}
            onOrderChange={(newOrder) => setLocalHabits(newOrder)}
            onError={() => {
              toast.error("Failed to save habit order");
              setLocalHabits(habits); // revert
            }}
          />

          {/* Add Habit Dialog */}
          <HabitAddDialog
            onHabitAdded={(newHabit) =>
              setLocalHabits((prev) => [...prev, newHabit])
            }
          />
        </div>

        {/* Scrollable progress cells */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-x-auto flex-1 scroll-smooth"
        >
          <HabitGrid
            habits={localHabits}
            days={days}
            todayISO={todayISO}
            onToggle={handleToggle}
            todayRef={todayRef}
          />
        </div>
      </div>

      {(isPending || isLoading) && (
        <div className="text-xs text-muted-foreground text-center py-1">
          Saving...
        </div>
      )}
    </div>
  );
}
