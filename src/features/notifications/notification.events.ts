// src/features/notifications/notification.events.ts
//
// The header bell and the full Notification Center page are separate
// component instances with no shared state (this codebase has no Redux/
// Zustand). Whenever either surface changes read/archived status, it emits
// this event so the bell's unread badge updates immediately instead of
// waiting for its next poll cycle.

const NOTIFICATIONS_CHANGED_EVENT = "app-notifications-changed";

export function emitNotificationsChanged(): void {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export function onNotificationsChanged(callback: () => void): () => void {
  window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, callback);
  return () => window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, callback);
}
