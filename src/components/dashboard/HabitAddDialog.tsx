"use client";

import { addHabit } from "@/actions/habit";
import * as AllPins from "@/assets/pins";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HabitWithProgress } from "@/types/habits";
import { useState, useTransition } from "react";
import HabitPin from "./HabitPin";

const pinMap: Record<string, React.ElementType> = { ...AllPins };

interface HabitAddDialogProps {
  onHabitAdded?: (habit: HabitWithProgress) => void;
}

export default function HabitAddDialog({ onHabitAdded }: HabitAddDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [shape, setShape] = useState("circle");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Please enter a habit title.");
      return;
    }

    startTransition(async () => {
      try {
        const habit = await addHabit({ title, shape });
        const normalizedHabit: HabitWithProgress = {
          ...habit,
          progress: habit.progress as Record<string, boolean>,
        };
        onHabitAdded?.(normalizedHabit);
        setIsOpen(false);
        setTitle("");
        setShape("circle");
      } catch (err) {
        console.error(err);
        alert("Failed to add habit. Please try again.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="px-3 py-2 my-1 font-bold text-red-500 border-r border-r-blue-500 text-center hover:bg-muted/40 cursor-pointer transition">
          +
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Habit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-3">
          <div className="space-y-2">
            <Label htmlFor="habitTitle">Title</Label>
            <Input
              id="habitTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exercise, Read"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Shape</Label>
            <div className="border rounded-md h-[300px] overflow-y-auto">
              {Object.keys(pinMap).map((s) => (
                <div
                  key={s}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/30 transition ${
                    shape === s ? "bg-primary/20" : ""
                  }`}
                  onClick={() => setShape(s)}
                >
                  <HabitPin shape={s} done={false} />
                  <span className="capitalize">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
