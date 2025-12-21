import * as z from 'zod';

export const enquirySchema = z
  .object({
    // customer
    cust_id: z.number().optional().nullable(),
    customer_name: z.string().optional(),
    customer_mobile: z.string().optional(),
    customer_email: z.string().optional(),

    // package
    pkg_id: z.number().optional().nullable(),
    package_name: z.string().optional(),

    // enquiry core
    pax_count: z.number().min(1),
    type: z.enum(['General', 'Warm']),
    status: z.enum(['Hot', 'Warm', 'Cold']),
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
