import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date as DD.MM.YYYY
 */
export function formatDateDDMMYYYY(date: Date | string | number): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Formátuje dátum na slovenský/európsky štandard: 08.01.2026 21:47
 */
export const formatDateTimeDDMMYYYY = (date: Date | string | number): string => {
  if (!date) return "N/A";

  const d = new Date(date);

  // Kontrola, či je dátum validný
  if (isNaN(d.getTime())) return "Invalid Date";

  return new Intl.DateTimeFormat('sk-SK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);
};

