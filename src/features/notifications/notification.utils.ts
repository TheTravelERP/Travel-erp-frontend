// src/features/notifications/notification.utils.ts
//
// Maps a notification's related_entity_type to the detail route of the
// module that owns it, so "Open Related Record" can navigate directly.
// Add an entry here whenever a new business service starts calling
// create_app_notification() with a new related_entity_type.

const RELATED_ENTITY_ROUTES: Record<string, string> = {
  enquiry: "/app/enquiries",
  enquiry_followup: "/app/crm/followups",
  customer: "/app/crm/customers",
};

export function getRelatedRecordPath(
  relatedEntityType?: string,
  relatedEntityUuid?: string,
): string | undefined {
  if (!relatedEntityType || !relatedEntityUuid) return undefined;
  const base = RELATED_ENTITY_ROUTES[relatedEntityType];
  if (!base) return undefined;
  return `${base}/${relatedEntityUuid}`;
}

export type NotificationDateGroup = "today" | "yesterday" | "earlier";

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function groupByDate(createdAt: string): NotificationDateGroup {
  const created = new Date(createdAt);
  const now = new Date();

  if (isSameCalendarDay(created, now)) return "today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (isSameCalendarDay(created, yesterday)) return "yesterday";

  return "earlier";
}
