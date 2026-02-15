/** Strip ANSI escape codes (e.g. from terminal output) for display in UI */
export function stripAnsi(text: string): string {
  if (typeof text !== 'string') return String(text);
  return text
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/\u001b\[?[0-9;]*[A-Za-z]/g, '')
    .trim();
}
