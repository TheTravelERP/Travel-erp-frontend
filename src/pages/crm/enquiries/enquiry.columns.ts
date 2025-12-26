import type { EnquiryListColumn } from './enquiry.types'; // local UI type (optional)
// local UI type (optional)

/**
 * Columns for Enquiry List
 * Driven strictly by ERD + business need
 */
export const enquiryColumns: EnquiryListColumn[] = [
  {
    id: 'id',
    label: 'Enquiry',
    sortable: true,
    minWidth: 90,
  },
  {
    id: 'customer_name',
    label: 'Customer',
    sortable: true,
    minWidth: 200,
  },
  {
    id: 'customer_mobile',
    label: 'Mobile',
    sortable: true,
    minWidth: 200,
  },
  {
    id: 'package_name',
    label: 'Package',
    sortable: true,
    minWidth: 220,
  },
  {
    id: 'pax_count',
    label: 'PAX',
    sortable: true,
    align: 'center',
    minWidth: 80,
  },
  {
    id: 'priority',
    label: 'Priority',
    sortable: true,
    format: 'chip',
    minWidth: 110,
  },
  {
    id: 'conversion_status',
    label: 'Conversion',
    sortable: true,
    format: 'chip',
    minWidth: 120,
  },
  {
    id: 'agent_name',
    label: 'Agent',
    sortable: true,
    minWidth: 160,
  },
  {
    id: 'created_at',
    label: 'Created On',
    sortable: true,
    format: 'date',
    minWidth: 140,
  },
];
