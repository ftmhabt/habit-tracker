"use client";

import { toggleHabitProgress } from "@/actions/dashboard";
import type { HabitWithProgress } from "@/types/habits";
import { useTransition } from "react";

interface UseHabitProgressOptions {
  onUpdate?: (updatedHabits: HabitWithProgress[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Handles toggling habit progress with optimistic updates and rollback on error.
 */
export function useHabitProgress({
  onUpdate,
  onError,
}: UseHabitProgressOptions = {}) {
  const [isPending, startTransition] = useTransition();

  /**
   * Toggle the progress of a habit for a specific date.
   * @param habits Current habit list (source of truth)
   * @param habitId ID of the habit to toggle
   * @param date Target date (ISO string)
   */
  const toggleProgress = (
    habits: HabitWithProgress[],
    habitId: string,
    date: string
  ) => {
    // optimistic local update
    const updatedHabits = habits.map((h) =>
      h.id === habitId
        ? { ...h, progress: { ...h.progress, [date]: !h.progress?.[date] } }
        : h
    );

    onUpdate?.(updatedHabits);

    startTransition(async () => {
      try {
        await toggleHabitProgress(habitId, date);
      } catch (err) {
        console.error("Failed to toggle progress:", err);
        // revert the optimistic toggle
        const revertedHabits = habits.map((h) =>
          h.id === habitId
            ? { ...h, progress: { ...h.progress, [date]: !h.progress?.[date] } }
            : h
        );
        onUpdate?.(revertedHabits);
        onError?.(err as Error);
      }
    });
  };

  return {
    isPending,
    toggleProgress,
  };
}
