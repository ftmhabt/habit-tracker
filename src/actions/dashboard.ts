"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDashboardData() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

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
  if (!habit) throw new Error("Habit not found");

  const progress = (habit.progress as Record<string, boolean>) || {};
  progress[date] = !progress[date];

  await prisma.habit.update({
    where: { id: habitId },
    data: { progress },
  });

  revalidatePath("/dashboard");
}
