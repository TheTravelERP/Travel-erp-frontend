// src/features/booking/booking.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';
import { MOBILE_NUMBER_REGEX } from '../../utils/validator';

export const getBookingSchema = (t: TFunction) =>
  z.object({
    // Optional — when no enquiry is picked (Direct Booking), the
    // customer_*/cust_uuid fields below are required instead (see refine).
    enquiry_uuid: z.string().nullable().optional(),
    cust_uuid: z.string().nullable().optional(),
    customer_mode: z.enum(['new', 'existing']).optional(),
    customer_name: z.string().trim().optional(),
    customer_mobile: z.string().optional(),
    customer_email: z.string().email().optional().or(z.literal('')),
    business_type: z.string().trim().min(1, t('booking.validation.businessTypeRequired')),
    pkg_uuid: z.string().nullable().optional(),
    pkg_count: z.coerce.number().int().min(1, t('booking.validation.packageCountMin')).default(1),
    departure_uuid: z.string().nullable().optional(),
    agent_uuid: z.string().nullable().optional(),
    booking_date: z.string().optional(),
    travel_start_date: z.string().optional(),
    travel_end_date: z.string().optional(),
    pax_adult: z.coerce.number().int().min(0).default(0),
    pax_child: z.coerce.number().int().min(0).default(0),
    pax_infant: z.coerce.number().int().min(0).default(0),
    currency_code: z.string().trim().length(3, t('booking.validation.currencyCode3')),
    reference: z.string().optional(),
    internal_notes: z.string().optional(),
    customer_notes: z.string().optional(),
  }).refine(
    (data) => !data.travel_start_date || !data.travel_end_date || data.travel_start_date <= data.travel_end_date,
    { message: t('validation.endDateBeforeStartDate'), path: ['travel_end_date'] },
  ).refine(
    (data) =>
      !!data.enquiry_uuid ||
      !!data.cust_uuid ||
      (!!data.customer_name?.trim() && !!data.customer_mobile),
    {
      message: t('booking.validation.customerOrEnquiryRequired'),
      path: ['customer_name'],
    },
  ).refine(
    (data) =>
      !!data.enquiry_uuid ||
      !!data.cust_uuid ||
      !data.customer_mobile ||
      MOBILE_NUMBER_REGEX.test(data.customer_mobile),
    {
      message: t('validation.internationalMobile'),
      path: ['customer_mobile'],
    },
  );

export type BookingSchema = ReturnType<typeof getBookingSchema>;
