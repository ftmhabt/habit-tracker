"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addHabit(data: { title: string; shape: string }) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }
  const last = await prisma.habit.findFirst({
    where: { userId: user.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const newOrder = (last?.order ?? -1) + 1;

  const visual = await prisma.pinStyle.create({
    data: {
      shape: data.shape,
      name: `${data.title} Visual`,
    },
  });

  const newHabit = await prisma.habit.create({
    data: {
      title: data.title,
      frequency: "daily",
      userId: user.id,
      progress: {},
      visualId: visual.id,
      order: newOrder,
    },
    include: {
      visual: true,
    },
  });

  return newHabit;
}

export type HabitOrderUpdate = { id: string; order: number };

export async function updateHabitsOrder(updates: HabitOrderUpdate[]) {
  "use server";
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Optional: verify all habits belong to the user
  const ids = updates.map((u) => u.id);
  const habits = await prisma.habit.findMany({ where: { id: { in: ids } } });
  for (const h of habits) {
    if (h.userId !== user.id) throw new Error("Permission denied");
  }

  // Use a transaction to update all orders
  const tx = updates.map((u) =>
    prisma.habit.update({ where: { id: u.id }, data: { order: u.order } })
  );
  await prisma.$transaction(tx);

  // Optional: revalidate profile pages or caches
  revalidatePath(`/dashboard`);

  return { ok: true };
}
