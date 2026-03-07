import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 'cn' function jo Tailwind classes ko merge karta hai
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}