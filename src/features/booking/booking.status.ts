// src/features/booking/booking.status.ts
// Mirrors app/services/booking_status_utils.py 1:1 — single shared source of
// truth for the Booking "pre-commit stage" concept on the frontend.

export const PRECOMMIT_STATUSES = ["Draft"] as const;

export function isPrecommitStatus(status: string): boolean {
  return (PRECOMMIT_STATUSES as readonly string[]).includes(status);
}

// Sales Context (Customer, Enquiry, Business Type, Package, Departure,
// Currency) is editable only while the booking is pre-commit AND wasn't
// created via Quotation conversion — a converted booking never has an
// editable window at all, since it was already committed at the Quotation
// stage.
export function isSalesContextEditable(booking: { status: string; quotation_uuid?: string | null }): boolean {
  return isPrecommitStatus(booking.status) && !booking.quotation_uuid;
}
