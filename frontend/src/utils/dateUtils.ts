/**
 * Pure date calculation utilities for legal age verification (18+)
 * and boundary calculations across LoveAgain platform.
 */

/**
 * Calculates the exact age in years from an ISO date string (YYYY-MM-DD).
 * Accurately handles leap years and birthday calendar dates.
 */
export function calculateAge(dobString?: string | null, asOfDate: Date = new Date()): number {
  if (!dobString) return 0;
  const parts = dobString.split('-');
  if (parts.length !== 3) return 0;

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return 0;

  const dob = new Date(Date.UTC(year, month, day));
  if (isNaN(dob.getTime())) return 0;

  let age = asOfDate.getUTCFullYear() - dob.getUTCFullYear();
  const m = asOfDate.getUTCMonth() - dob.getUTCMonth();
  if (m < 0 || (m === 0 && asOfDate.getUTCDate() < dob.getUTCDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Checks whether a given birthdate satisfies the minimum legal age requirement (default: 18).
 */
export function isLegalAge(dobString?: string | null, legalAge = 18, asOfDate: Date = new Date()): boolean {
  if (!dobString) return false;
  return calculateAge(dobString, asOfDate) >= legalAge;
}

/**
 * Returns the maximum birth date allowed for legal age (18+) in YYYY-MM-DD format,
 * suitable for the `max` attribute on HTML5 `<input type="date">`.
 */
export function getMaxLegalBirthdate(legalAge = 18, asOfDate: Date = new Date()): string {
  const maxYear = asOfDate.getUTCFullYear() - legalAge;
  const month = String(asOfDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(asOfDate.getUTCDate()).padStart(2, '0');
  return `${maxYear}-${month}-${day}`;
}

