// filepath: src/lib/utils/cn.ts
/**
 * Class name utility — merges Tailwind classes correctly.
 * Prevents specificity conflicts when conditionally applying classes.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
