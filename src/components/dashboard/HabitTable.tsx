"use client";

import { toggleHabitProgress } from "@/actions/dashboard";
import { motion } from "framer-motion";
import { useTransition } from "react";

export default function HabitTable({ habits }: { habits: any[] }) {
  const [isPending, startTransition] = useTransition();

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // helper to get Monday–Sunday date strings for this week
  const getWeekDates = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    return days.map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d.toISOString().split("T")[0];
    });
  };

  const weekDates = getWeekDates();

  const handleToggle = (habitId: string, date: string) => {
    startTransition(async () => {
      await toggleHabitProgress(habitId, date);
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-muted bg-background/80 shadow-sm">
      <table className="w-full border-collapse text-sm md:text-base">
        <thead>
          <tr className="bg-muted/40">
            <th className="border px-3 py-2 text-left font-medium">Habit</th>
            {days.map((d) => (
              <th key={d} className="border px-3 py-2 font-medium text-center">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => (
            <tr key={habit.id} className="hover:bg-muted/20 transition-colors">
              <td className="border px-3 py-2 font-medium">{habit.title}</td>
              {weekDates.map((date) => {
                const done = habit.progress?.[date];
                return (
                  <td
                    key={date}
                    onClick={() => handleToggle(habit.id, date)}
                    className="border px-3 py-2 text-center cursor-pointer select-none relative"
                  >
                    <motion.span
                      initial={false}
                      animate={done ? { scale: [0, 1.3, 1] } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="inline-block"
                    >
                      {done ? "🌟" : ""}
                    </motion.span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
