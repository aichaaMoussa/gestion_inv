import { z } from "zod";

export const consultationSchema = z.object({
  patientId: z.string().min(1, "Le patient est requis"),
  dateConsultation: z.date(),
  ordonnance: z.string().optional(),
  commentaire: z.string().optional(),
  dosage: z.string().optional(),
  dateRendezVous: z.date().optional(),
});

export type ConsultationFormData = z.infer<typeof consultationSchema>; 