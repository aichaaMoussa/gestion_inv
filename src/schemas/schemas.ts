import { z } from "zod";

// Schéma pour l'historique médical
export const MedicalHistorySchema = z.object({
  date: z.date(), // Date de la consultation
  diagnosis: z.string().min(1, "Le diagnostic est requis"), // Diagnostic
  prescriptions: z.array(z.string()).optional(), // Médicaments prescrits
  notes: z.string().optional(), // Notes facultatives
});

// Schéma pour les patients
export const PatientSchema = z.object({
  doctorId: z.string(),
  firstName: z.string().min(1, "Le prénom est requis"), // Prénom du patient
  lastName: z.string().min(1, "Le nom de famille est requis"), // Nom
  nni: z.string().length(10, "Le NNI doit avoir exactement 10 caractères"), // Numéro d'identification nationale
  adress: z.string().min(1, "L'adress est requis"),
  telephone: z.string().min(1, "Le telephone est requis"),
  age: z.string().min(1),
});
export const userShemas = z.object({
  nom: z.string().min(3),
  prenom: z.string().min(3),
  nni: z.string().min(2, "required"),
  phone: z.string().min(2, "required"),
  roleId: z.string().min(2, "required"),
  username: z.string().min(3, "Le nom d'utilisateur est requis."),
  password: z
    .string()
    .min(6, "Le mot de passe doit avoir au moins 6 caractères."),
});

// Type TypeScript dérivé du schéma
export type PatientType = z.infer<typeof PatientSchema>;
