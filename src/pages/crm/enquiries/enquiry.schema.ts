//src/pages/crm/enquiries/enquiries.schema.ts
import * as z from 'zod';

export const enquirySchema = z
  .object({
    // customer
    cust_id: z.number().nullable().optional(),
    customer_name: z.string().trim().optional(),
    customer_mobile: z.string().optional(),
    customer_email: z.string().email().optional(),


    // package
    pkg_id: z.number().nullable().optional(),
    package_name: z.string().trim().optional(),

    // enquiry core
    pax_count: z.coerce.number().min(1, 'Minimum 1 PAX'),
    lead_source: z.enum(['Website', 'Agent', 'WalkIn', 'Referral', 'Corporate', 'Others']),
    priority: z.enum(['Hot', 'Warm', 'Cold']),
    conversion_status: z.enum(['Lost', 'Pending', 'Converted']),
    description: z.string().optional(),
  })
  .refine(
    (data) =>
      data.cust_id ||
      (data.customer_name && data.customer_name.length > 0),
    {
      message: 'Customer is required',
      path: ['customer_name'],
    }
  )
  .refine(
    (data) =>
      data.pkg_id ||
      (data.package_name && data.package_name.length > 0),
    {
      message: 'Package is required',
      path: ['package_name'],
    }
  );
