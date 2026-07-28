// src/features/settings/eventAutomation/eventAutomation.api.ts
import api from "../../../services/api";
import type { EventRuleItem, EventRuleListApiResponse, EventRuleUpsertPayload } from "./eventAutomation.types";

export async function getEventRules(): Promise<EventRuleListApiResponse> {
  const { data } = await api.get<EventRuleListApiResponse>("/api/v1/notification-event-rules");
  return data;
}

export async function upsertEventRule(eventCode: string, payload: EventRuleUpsertPayload): Promise<EventRuleItem> {
  const { data } = await api.put<EventRuleItem>(`/api/v1/notification-event-rules/${eventCode}`, payload);
  return data;
}
