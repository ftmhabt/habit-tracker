"use client";

import { toggleHabitProgress } from "@/actions/dashboard";
import { addHabit } from "@/actions/habit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Habit } from "@prisma/client";
import { addDays, format, startOfToday } from "date-fns";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

type HabitWithProgress = Omit<Habit, "progress"> & {
  progress: Record<string, boolean>;
};

export default function HabitTable({
  habits,
}: {
  habits: HabitWithProgress[];
}) {
  const [isPending, startTransition] = useTransition();
  const [localHabits, setLocalHabits] = useState(habits);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitShape, setNewHabitShape] = useState("circle");

  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const initialScrollDone = useRef(false);

  const today = startOfToday();
  const todayISO = format(today, "yyyy-MM-dd");

  // ✅ 14-day window
  const [days, setDays] = useState(() => {
    const start = addDays(today, -7);
    return Array.from({ length: 15 }, (_, i) =>
      format(addDays(start, i), "yyyy-MM-dd")
    );
  });

  // Infinite scroll for days
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

  // Scroll to today
  const scrollToToday = useCallback(() => {
    const parent = scrollRef.current;
    const todayEl = todayRef.current;
    if (!parent || !todayEl) return;

    const offsetLeft = todayEl.offsetLeft;
    const habitColumnWidth = 120;
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

  useEffect(() => {
    if (!initialScrollDone.current && days.length > 0) {
      initialScrollDone.current = true;
      requestAnimationFrame(scrollToToday);
    }
  }, [days, scrollToToday]);

  // Toggle progress (optimistic)
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
      } catch (err) {
        console.error(err);
        alert("You can only update today's progress.");
      }
    });
  };

  const handleAddHabit = async () => {
    if (!newHabitTitle.trim()) return;

    try {
      const habit = await addHabit({
        title: newHabitTitle,
        shape: newHabitShape,
      });

      const normalizedHabit: HabitWithProgress = {
        ...habit,
        progress: (habit.progress as Record<string, boolean>) || {},
      };

      setLocalHabits((prev) => [...prev, normalizedHabit]);
      setIsDialogOpen(false);
      setNewHabitTitle("");
      setNewHabitShape("circle");
    } catch (err) {
      console.error(err);
      alert("Failed to add habit");
    }
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
          {localHabits.map((habit) => (
            <div
              key={habit.id}
              className="px-3 py-2 border-b border-muted text-sm truncate"
            >
              {habit.title}
            </div>
          ))}

          {/* ➕ Add Habit cell */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div className="px-3 py-2 border-b border-muted text-sm text-primary hover:bg-muted/40 cursor-pointer transition">
                + Add Habit
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Habit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="habitTitle">Title</Label>
                  <Input
                    id="habitTitle"
                    value={newHabitTitle}
                    onChange={(e) => setNewHabitTitle(e.target.value)}
                    placeholder="e.g. Exercise, Read"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Shape</Label>
                  <Select
                    value={newHabitShape}
                    onValueChange={setNewHabitShape}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose shape" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="star">Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button onClick={handleAddHabit}>Add</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Scrollable progress cells */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-x-auto flex-1 scroll-smooth"
        >
          <div className="min-w-max">
            {/* Header days */}
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
                    {d.slice(5)}
                  </div>
                );
              })}
            </div>

            {/* Habit progress rows */}
            {localHabits.map((habit) => (
              <div key={habit.id} className="flex">
                {days.map((date) => {
                  const done = habit.progress?.[date];
                  const isToday = date === todayISO;
                  const isClickable = isToday;

                  return (
                    <div
                      key={`${habit.id}-${date}`}
                      onClick={
                        isClickable
                          ? () => handleToggle(habit.id, date)
                          : undefined
                      }
                      className={`w-16 h-10 border-r border-b border-muted flex items-center justify-center select-none ${
                        isClickable
                          ? "cursor-pointer active:scale-95 transition"
                          : "opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <motion.span
                        initial={false}
                        animate={done ? { scale: [0, 1.3, 1] } : { scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {done ? "🌟" : ""}
                      </motion.span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {isPending && (
        <div className="text-xs text-muted-foreground text-center py-1">
          Saving...
        </div>
      )}
    </div>
  );
}
