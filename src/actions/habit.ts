"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addHabit(data: { title: string; shape: string }) {
  const user = await getCurrentUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

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
    },
    include: {
      visual: true,
    },
  });

  return newHabit;
}
