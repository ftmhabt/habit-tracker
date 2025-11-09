"use client";

import { useState } from "react";
import { toast } from "react-toastify";

export function useUiFeedback() {
  const [isLoading, setIsLoading] = useState(false);

  const wrapAsync = async <T>(fn: () => Promise<T>, label = "Saving...") => {
    setIsLoading(true);
    const toastId = toast.loading(label);

    try {
      const result = await fn();
      toast.update(toastId, {
        render: "Saved!",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
      return result;
    } catch (err: any) {
      console.error(err);
      toast.update(toastId, {
        render: err.message || "Something went wrong",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, wrapAsync };
}
