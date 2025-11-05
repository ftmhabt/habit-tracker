"use client";

import { toggleHabitProgress } from "@/actions/dashboard";
import { addDays, format, startOfToday } from "date-fns";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export default function HabitTable({ habits }: { habits: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [localHabits, setLocalHabits] = useState(habits);
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const initialScrollDone = useRef(false);

  const today = startOfToday();
  const todayISO = format(today, "yyyy-MM-dd");

  // ✅ Compute initial 14-day window directly in useState
  const [days, setDays] = useState(() => {
    const start = addDays(today, -7);
    return Array.from({ length: 15 }, (_, i) =>
      format(addDays(start, i), "yyyy-MM-dd")
    );
  });

  // Append more days on scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (scrollLeft > scrollWidth - clientWidth - 80 && !loadingRef.current) {
      loadingRef.current = true;
      const last = new Date(days[days.length - 1]);
      const more = Array.from({ length: 7 }, (_, i) =>
        format(addDays(last, i + 1), "yyyy-MM-dd")
      );
      setDays((prev) => [...prev, ...more]);
      requestAnimationFrame(() => (loadingRef.current = false));
    }
  }, [days]);

  // Scroll to today's column
  const scrollToToday = useCallback(() => {
    const parent = scrollRef.current;
    const todayEl = todayRef.current;
    if (!parent || !todayEl) return;

    // Get the offset of the "today" cell relative to the scrollable area
    const offsetLeft = todayEl.offsetLeft;

    // Account for the fixed habit column (same width as your .min-w-[120px])
    const habitColumnWidth = 120;

    // Calculate scroll position so "today" is centered in view
    const targetScroll =
      offsetLeft -
      parent.clientWidth / 2 +
      todayEl.clientWidth / 2 -
      habitColumnWidth;

    parent.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  }, []);

  // Auto-scroll to today once days are ready
  useEffect(() => {
    if (!initialScrollDone.current && days.length > 0) {
      initialScrollDone.current = true;
      requestAnimationFrame(scrollToToday);
    }
  }, [days, scrollToToday]);

  // Toggle progress (optimistic update)
  const handleToggle = (habitId: string, date: string) => {
    setLocalHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? {
              ...h,
              progress: {
                ...h.progress,
                [date]: !h.progress?.[date],
              },
            }
          : h
      )
    );

    startTransition(async () => {
      try {
        await toggleHabitProgress(habitId, date);
      } catch (e) {
        console.error("Toggle failed", e);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3">
        <h2 className="font-semibold text-lg">Habits</h2>
        <button
          onClick={scrollToToday}
          className="px-3 py-1.5 text-sm bg-primary text-white rounded-md shadow hover:bg-primary/90 transition"
        >
          Today
        </button>
      </div>

      {/* Table container */}
      <div className="flex border border-muted rounded-xl bg-background/80 shadow-sm overflow-hidden">
        {/* Fixed left column */}
        <div className="min-w-[120px] border-r border-muted bg-muted/30">
          <div className="sticky top-0 px-3 py-2 font-semibold border-b border-muted bg-muted/40 text-sm">
            Habit
          </div>
          {localHabits.map((habit) => (
            <div
              key={habit.id}
              className="px-3 py-2 border-b border-muted text-sm truncate"
            >
              {habit.title}
            </div>
          ))}
        </div>

        {/* Scrollable section */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-x-auto flex-1 scroll-smooth"
        >
          <div className="min-w-max">
            {/* Header row (days) */}
            <div className="flex border-b border-muted bg-muted/40">
              {days.map((d) => {
                const isToday = d === todayISO;
                return (
                  <div
                    key={d}
                    ref={isToday ? todayRef : null}
                    className={`w-16 text-center py-2 font-medium border-r border-muted text-xs sm:text-sm ${
                      isToday
                        ? "bg-primary/20 text-primary font-semibold rounded-sm border-primary"
                        : ""
                    }`}
                  >
                    {d.slice(5)} {/* show MM-DD */}
                  </div>
                );
              })}
            </div>

            {/* Habit rows */}
            {localHabits.map((habit) => (
              <div key={habit.id} className="flex">
                {days.map((date) => {
                  const done = habit.progress?.[date];
                  return (
                    <button
                      key={`${habit.id}-${date}`}
                      type="button"
                      onClick={() => handleToggle(habit.id, date)}
                      aria-pressed={done}
                      className={`w-16 h-10 border-r border-b border-muted flex items-center justify-center select-none transition ${
                        done
                          ? "bg-green-500/60 hover:bg-green-500/70"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <motion.span
                        initial={false}
                        animate={done ? { scale: [0, 1.3, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {done ? "🌟" : ""}
                      </motion.span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subtle feedback */}
      {isPending && (
        <div className="text-xs text-muted-foreground text-center py-1">
          Saving...
        </div>
      )}
    </div>
  );
}
