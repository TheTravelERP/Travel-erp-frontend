import * as z from 'zod';

export const enquirySchema = z.object({
  cust_id: z.number(),
  pax_count: z.number().min(1),
  type: z.enum(['General', 'Warm']),
  status: z.enum(['Hot', 'Warm', 'Cold']),
  conversion_status: z.enum(['Lost', 'Pending', 'Converted']),
});
