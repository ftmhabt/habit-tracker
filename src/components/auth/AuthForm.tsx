"use client";

import { registerUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import GoogleButton from "./GoogleButton";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);

    if (mode === "register") {
      try {
        await registerUser(form);
        toast.success("Registered! Please login.");
      } catch {
        toast.error("Registration failed");
      }
    } else {
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false,
      });
      if (result?.ok) router.push("/dashboard");
      else toast.error("Invalid credentials");
    }
    setLoading(false);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
        <Input name="email" placeholder="Email" type="email" />
        <Input name="password" placeholder="Password" type="password" />

        <Button type="submit" className="w-full" disabled={loading}>
          {mode === "register" ? "Sign up" : "Log in"}
        </Button>
      </form>{" "}
      <div className="flex flex-col items-center justify-center">
        <span className="text-sm text-muted-foreground">or</span>
        <GoogleButton />
      </div>
    </>
  );
}
