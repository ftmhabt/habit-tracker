"use client";

import { addDays, format, startOfToday } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";

export function useHabitDays() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);
  const initialScrollDone = useRef(false);

  const today = startOfToday();
  const todayISO = format(today, "yyyy-MM-dd");

  // start with 14-day window centered around today
  const [days, setDays] = useState(() => {
    const start = addDays(today, -7);
    return Array.from({ length: 15 }, (_, i) =>
      format(addDays(start, i), "yyyy-MM-dd")
    );
  });

  /** Handle infinite scroll: load more days when near the end */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const nearEnd = scrollLeft > scrollWidth - clientWidth - 80;
    if (nearEnd && !loadingRef.current) {
      loadingRef.current = true;
      const lastDate = new Date(days[days.length - 1]);
      const more = Array.from({ length: 7 }, (_, i) =>
        format(addDays(lastDate, i + 1), "yyyy-MM-dd")
      );
      setDays((prev) => [...prev, ...more]);
      requestAnimationFrame(() => (loadingRef.current = false));
    }
  }, [days]);

  /** Scroll to today's column */
  const scrollToToday = useCallback(() => {
    const parent = scrollRef.current;
    const todayEl = todayRef.current;
    if (!parent || !todayEl) return;

    const offsetLeft = todayEl.offsetLeft;
    const habitColumnWidth = 120;
    const targetScroll =
      offsetLeft -
      parent.clientWidth / 2 +
      todayEl.clientWidth / 2 -
      habitColumnWidth;

    parent.scrollTo({ left: targetScroll, behavior: "smooth" });
  }, []);

  /** Auto-scroll to today once after mount */
  useEffect(() => {
    if (!initialScrollDone.current && days.length > 0) {
      initialScrollDone.current = true;
      requestAnimationFrame(scrollToToday);
    }
  }, [days, scrollToToday]);

  return {
    days,
    todayISO,
    scrollRef,
    todayRef,
    handleScroll,
    scrollToToday,
  };
}
