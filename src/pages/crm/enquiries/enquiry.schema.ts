//src/pages/crm/enquiries/enquiries.schema.ts
import * as z from 'zod';

export const enquirySchema = z
  .object({
    // customer
    cust_id: z.number().nullable().optional(),
    customer_name: z.string().trim().optional(),
    customer_mobile: z.string().optional(),
    customer_email: z.string().email().optional().or(z.literal('')),


    // package
    pkg_id: z.number().nullable().optional(),
    package_name: z.string().trim().optional(),

    // enquiry core
    pax_count: z.coerce.number().min(1, 'Minimum 1 PAX'),
    lead_source: z.string().trim().optional(),
    priority: z.string().trim().optional(),
    conversion_status: z.string().trim().optional(),
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
      data.cust_id || (data.customer_mobile && data.customer_mobile.length >= 10),
    {
      message: 'Mobile number is required (min 10 digits)',
      path: ['customer_mobile'],
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

  
