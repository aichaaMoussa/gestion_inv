import { z } from "zod";

export const consultationSchema = z.object({
  patientId: z.string().min(1, "Le patient est requis"),
  dateConsultation: z.date({
    required_error: "La date de consultation est requise",
  }),
  ordonnance: z.string().optional(),
  commentaire: z.string().optional(),
  dosage: z.string().optional(),
  dateRendezVous: z.date().optional().nullable(),
});

export type ConsultationFormData = z.infer<typeof consultationSchema>; 