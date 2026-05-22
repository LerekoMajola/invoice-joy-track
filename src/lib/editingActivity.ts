// Lightweight module-level singleton tracking active document editing sessions.
// Consumed by useInactivityLogout to avoid signing the user out while they
// are still entering data into a quote/invoice (or any registered editor).

const activeEditors = new Set<string>();
let lastPingAt = 0;

export function registerEditing(id: string) {
  activeEditors.add(id);
  lastPingAt = Date.now();
}

export function unregisterEditing(id: string) {
  activeEditors.delete(id);
}

export function pingEditingActivity() {
  lastPingAt = Date.now();
}

export function hasActiveEditing(): boolean {
  return activeEditors.size > 0;
}

export function lastEditingPingAt(): number {
  return lastPingAt;
}
