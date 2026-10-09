"use client";

import { useSyncExternalStore } from "react";
import type { Signal } from "@/lib/world";

/** Subscribes a component to a low-frequency world signal. */
export function useSignal<T>(s: Signal<T>) {
  return useSyncExternalStore(s.subscribe, s.get, s.get);
}
