"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export async function getDashboardData() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const habits = (
    await prisma.habit.findMany({ where: { userId: user.id } })
  ).map((h) => ({
    ...h,
    progress: (h.progress as Record<string, boolean>) || {},
  }));

  return {
    name: user.name as string,
    habits,
  };
}

export async function toggleHabitProgress(habitId: string, date: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  // Ownership check for security
  if (!habit || habit.userId !== user.id) {
    throw new Error("Habit not found or unauthorized");
  }

  // Normalize date to yyyy-MM-dd for consistency
  const normalizedDate = format(new Date(date), "yyyy-MM-dd");
  const progress = (habit.progress as Record<string, boolean>) || {};
  progress[normalizedDate] = !progress[normalizedDate];

  await prisma.habit.update({
    where: { id: habitId },
    data: { progress },
  });

  revalidatePath("/dashboard");
}
