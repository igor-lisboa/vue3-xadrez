/**
 * iPhones and iPads run Safari, which has no install prompt, so the app explains the manual step.
 * iPadOS 13+ reports itself as a Mac, so a Mac with a touch screen is treated as an iPad.
 */
export function isIosDevice(userAgent: string, maxTouchPoints: number): boolean {
  return /iPad|iPhone|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)
}

/** True when the app runs from the home screen (no browser bars), where installing is not offered. */
export function isStandaloneDisplay(
  displayModeStandalone: boolean,
  iosStandalone: boolean,
): boolean {
  return displayModeStandalone || iosStandalone
}
