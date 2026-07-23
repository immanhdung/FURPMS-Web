import { z } from "zod";

export const trackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  ownerId: z.string().optional(),
  /**
   * Only meaningful when creating without a fixed cycle already in context (the edit flow never
   * sets this, so it can't be required unconditionally here) — validated manually in the submit
   * handler instead.
   */
  cycleId: z.number().optional(),
});

export type TrackFormValues = z.infer<typeof trackSchema>;
