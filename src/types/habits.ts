import { Habit, PinStyle } from "@prisma/client";

export type HabitWithProgress = Omit<Habit, "progress"> & {
  progress: Record<string, boolean>;
  visual?: PinStyle | null;
};
