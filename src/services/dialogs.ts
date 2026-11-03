// Thin wrappers around the browser dialogs, so the rest of the app does not call `window` directly.

export function notify(message: string): void {
  window.alert(message)
}

/** Asks for a text value. Returns null when the user cancels. */
export function askText(question: string): string | null {
  return window.prompt(question)
}
