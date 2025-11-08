"use client";

import { cn } from "@/lib/utils"; // optional helper for joining classNames
import { motion } from "framer-motion";

// Import all your SVGs or React components for shapes
import CirclePin from "@/assets/pins/circle.svg";
import HeartPin from "@/assets/pins/heart.svg";
import SquarePin from "@/assets/pins/square.svg";
import StarPin from "@/assets/pins/star.svg";

// ...import more as needed

// Map shapes to components
const pinMap: Record<string, React.ElementType> = {
  circle: CirclePin,
  square: SquarePin,
  star: StarPin,
  heart: HeartPin,
  // add more mappings as your library grows
};

interface HabitPinProps {
  shape: string;
  done: boolean;
}

export default function HabitPin({ shape, done }: HabitPinProps) {
  const Pin = pinMap[shape] || CirclePin; // fallback to circle if unknown

  return (
    <motion.div
      initial={false}
      animate={done ? { scale: [0, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "w-5 h-5 flex items-center justify-center",
        done ? "text-primary" : "opacity-40"
      )}
    >
      <Pin
        className={cn(
          "w-full h-full transition-colors",
          done ? "fill-primary" : "fill-muted-foreground/40"
        )}
      />
    </motion.div>
  );
}
