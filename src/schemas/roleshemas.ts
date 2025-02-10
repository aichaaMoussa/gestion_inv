import { z } from "zod";
export const MedicalHistorySchema = z.object({
  namear: z.string().min(2, "required"),
  namefr: z.string().min(2, "required"),
});
