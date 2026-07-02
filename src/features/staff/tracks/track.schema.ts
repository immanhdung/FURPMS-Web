import { z } from "zod";

export const trackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  ownerId: z.string().optional(),
});

export type TrackFormValues = z.infer<typeof trackSchema>;
