const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const HOURS_PER_DAY = 24

function twoDigits(value: number): string {
  return value.toString().padStart(2, '0')
}

/** Formats milliseconds as HH:MM:SS. Negative values are shown as 00:00:00. */
export function formatClock(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / MS_PER_SECOND))
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR) % HOURS_PER_DAY
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE) % SECONDS_PER_MINUTE
  const seconds = totalSeconds % SECONDS_PER_MINUTE
  return [hours, minutes, seconds].map(twoDigits).join(':')
}
