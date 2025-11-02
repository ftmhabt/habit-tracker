"use server";

import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveUserName(name: string) {
  const session = await getServerSession(authConfig);
  if (!session?.user.id) throw new Error("Not authenticated");

  await prisma.user.update({
    where: { id: session?.user.id },
    data: { name },
  });
  revalidatePath("/onboarding");
}

export async function saveFirstHabit(title: string) {
  const session = await getServerSession(authConfig);
  if (!session?.user.id) throw new Error("Not authenticated");

  await prisma.habit.create({
    data: {
      userId: session?.user.id,
      title,
      frequency: "daily", // default
    },
  });
  revalidatePath("/onboarding");
}

export async function finishOnboarding() {
  redirect("/dashboard");
}
