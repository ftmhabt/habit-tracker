"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { revalidatePath } from "next/cache";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !username) throw new Error("All fields required");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("User already exists");

  const passwordHash = await hash(password, 10);

  await prisma.user.create({
    data: { email, username, passwordHash },
  });

  revalidatePath("/login");
}
