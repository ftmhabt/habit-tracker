"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function GoogleButton() {
  return (
    <Button
      variant="outline"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="w-full flex items-center justify-center gap-2"
    >
      <FcGoogle size={20} />
      Continue with Google
    </Button>
  );
}
