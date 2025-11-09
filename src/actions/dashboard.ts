"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDashboardData() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const habits = (
    await prisma.habit.findMany({
      where: { userId: user.id },
      include: { visual: true },
      orderBy: { order: "asc" },
    })
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

  // Always compute "today" on the server (UTC-safe)
  const today = new Date();
  const todayISO = today.toLocaleDateString("en-CA"); // yyyy-mm-dd

  // Prevent toggling for any date other than today
  if (date !== todayISO) {
    throw new Error("You can only mark progress for today's date.");
  }

  // Fetch the habit
  const habit = await prisma.habit.findUnique({
    where: { id: habitId },
  });

  if (!habit) throw new Error("Habit not found");
  if (habit.userId !== user.id) throw new Error("Unauthorized");

  // Safely parse progress JSON
  const progress = (habit.progress as Record<string, boolean>) || {};

  // Toggle today's progress
  progress[todayISO] = !progress[todayISO];

  await prisma.habit.update({
    where: { id: habitId },
    data: { progress },
  });

  revalidatePath("/dashboard");
}
