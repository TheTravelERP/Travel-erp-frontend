// src/features/inventory/inventoryStock/inventoryStock.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getInventoryStockSchema = (t: TFunction) =>
  z
    .object({
      contract_uuid: z.string().trim().min(1, t('inventoryStock.validation.contractRequired')),
      inventory_code: z.string().trim().min(1, t('validation.codeRequired')).max(30),
      inventory_name: z.string().trim().min(1, t('validation.nameRequired')).max(200),
      service_type: z.string().trim().optional(),
      hotel_uuid: z.string().trim().optional(),
      airline_uuid: z.string().trim().optional(),
      ziyarat_uuid: z.string().trim().optional(),
      vendor_uuid: z.string().trim().optional(),
      start_date: z.string().trim().optional(),
      end_date: z.string().trim().optional(),
      total_qty: z.number().int(t('inventoryStock.validation.qtyWholeNumber')),
      booked_qty: z.number().int().optional(),
      blocked_qty: z.number().int().optional(),
      cost_price: z.number().optional(),
      selling_price: z.number().optional(),
      currency_code: z.string().trim().optional(),
      remarks: z.string().trim().optional(),
      status: z.string().trim().optional(),
      is_active: z.boolean().optional(),
    })
    .refine((data) => data.total_qty > 0, {
      message: t('inventoryStock.validation.totalQtyPositive'),
      path: ['total_qty'],
    })
    .refine((data) => (data.booked_qty ?? 0) <= data.total_qty, {
      message: t('inventoryStock.validation.bookedExceedsTotal'),
      path: ['booked_qty'],
    })
    .refine((data) => (data.blocked_qty ?? 0) <= data.total_qty - (data.booked_qty ?? 0), {
      message: t('inventoryStock.validation.blockedExceedsAvailable'),
      path: ['blocked_qty'],
    })
    .refine(
      (data) => !data.start_date || !data.end_date || data.end_date >= data.start_date,
      {
        message: t('validation.endDateBeforeStartDate'),
        path: ['end_date'],
      },
    );

export type InventoryStockSchema = ReturnType<typeof getInventoryStockSchema>;
