import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z
    .string("O nome da categoria é obrigatório")
    .regex(/^[a-zA-Z_]+$/, "O nome da categoria deve conter apenas letras e underline")
    .min(1, "O nome da categoria é obrigatório"),
});

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;

export const ResponseCategory = z.object({
  id: z.string(),
  name: z.string(),
  active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ResponseCategoryDTO = z.infer<typeof ResponseCategory>;

export const BaseResponseCategory = z.object({
  message: z.string(),
  status: z.number(),
});

export const AdminMetricsSchema = z.object({
  general: z.object({
    total_events: z.number(),
    total_users: z.number(),
    monthly_sales_growth: z.array(z.number()),
  }),
  event_management: z.object({
    active_events: z.number(),
    pending_events: z.number(),
    rejected_events: z.number(),
    blocked_events: z.number(),
    events_created_today: z.number(),
  }),
  user_management: z.object({
    total_users: z.number(),
    total_admins: z.number(),
    total_managers: z.number(),
    new_users_today: z.number(),
  }),
  content_management: z.object({
    total_categories: z.number(),
    pending_requests: z.number(),
    gallery_images: z.number(),
    service_fee: z.number(),
  }),
});

export type AdminMetricsDTO = z.infer<typeof AdminMetricsSchema>;
