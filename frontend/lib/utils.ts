import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Given a pathname string, returns a cleaned route path by removing numeric segments.
 *
 * For example, "/farms/1/crops/2" becomes "/farms/crops".
 *
 * @param pathname A pathname such as "/farms/1/crops/2"
 * @returns A cleaned pathname string starting with a "/"
 */
export function extractRoute(pathname: string): string {
  // Split the pathname into segments and remove any empty segments.
  const segments = pathname.split("/").filter(Boolean);
  // Remove segments which are entirely numeric.
  const nonNumericSegments = segments.filter((segment) => isNaN(Number(segment)));
  return "/" + nonNumericSegments.join("/");
}
