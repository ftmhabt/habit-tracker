"use client";

import {
  finishOnboarding,
  saveFirstHabit,
  saveUserName,
} from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [habit, setHabit] = useState("");
  const [loading, setLoading] = useState(false);

  const slides = [
    {
      title: "Let's start with your name",
      content: (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            await saveUserName(name);
            setLoading(false);
            setStep(1);
          }}
          className="flex flex-col gap-4"
        >
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            Continue
          </Button>
        </form>
      ),
    },
    {
      title: "Your first habit",
      content: (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            await saveFirstHabit(habit);
            setLoading(false);
            setStep(2);
          }}
          className="flex flex-col gap-4"
        >
          <Input
            placeholder="e.g. Drink water"
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            Continue
          </Button>
        </form>
      ),
    },
    {
      title: "You’re all set!",
      content: (
        <div className="flex flex-col gap-6">
          <p className="text-muted-foreground">
            Your first habit is ready, and your dashboard is waiting.
          </p>
          <Button
            onClick={async () => {
              setLoading(true);
              await finishOnboarding();
            }}
          >
            Go to Dashboard →
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold">{slides[step].title}</h2>
            {slides[step].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
