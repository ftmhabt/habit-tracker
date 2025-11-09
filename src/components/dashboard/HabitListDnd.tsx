"use client";

import { updateHabitsOrder } from "@/actions/habit";
import { HabitWithProgress } from "@/types/habits";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTransition } from "react";
import SortableHabitRow from "./SortableHabitRow";

interface HabitListDndProps {
  habits: HabitWithProgress[];
  onOrderChange?: (newHabits: HabitWithProgress[]) => void;
  onError?: (error: Error) => void;
}

export default function HabitListDnd({
  habits,
  onOrderChange,
  onError,
}: HabitListDndProps) {
  const [isPending, startTransition] = useTransition();

  // setup DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = habits.findIndex((h) => h.id === active.id);
    const newIndex = habits.findIndex((h) => h.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrderArray = arrayMove(habits, oldIndex, newIndex);

    // optimistic UI update
    onOrderChange?.(newOrderArray);

    // send to server
    const payload = newOrderArray.map((h, idx) => ({ id: h.id, order: idx }));

    startTransition(async () => {
      try {
        await updateHabitsOrder(payload);
      } catch (err) {
        console.error("Failed to save order:", err);
        onError?.(err as Error);
      }
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={habits.map((h) => h.id)}
        strategy={verticalListSortingStrategy}
      >
        {habits.map((habit) => (
          <SortableHabitRow key={habit.id} id={habit.id}>
            <div className="px-3 py-2 h-9 border-b border-muted text-sm truncate cursor-grab">
              {habit.title}
            </div>
          </SortableHabitRow>
        ))}
      </SortableContext>

      {isPending && (
        <div className="text-xs text-muted-foreground text-center py-1">
          Saving order...
        </div>
      )}
    </DndContext>
  );
}
