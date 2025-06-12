import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import { connectToDb } from "@/lib/mongoose";
import { z } from "zod";

const ConsultationSchema = z.object({
  patientId: z.string(),
  doctorId: z.string(),
  date: z.string(),
  description: z.string().min(1),
  diagnosis: z.string().min(1),
  prescription: z.string().min(1),
});

const handler = nextConnect();

handler
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ message: "ID du patient non fourni" });
    }

    try {
      const db = await connectToDb();
      const patientObjectId = new ObjectId(patientId as string);

      const consultations = await db
        .collection("consultations")
        .find({ patientId: patientObjectId })
        .sort({ date: -1 })
        .toArray();

      res.status(200).json(consultations);
    } catch (error: any) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const data = req.body;

      if (!ConsultationSchema.safeParse(data).success) {
        return res.status(400).json({ message: "Données invalides" });
      }

      const db = await connectToDb();
      const date = new Date();

      const consultationData = {
        ...data,
        patientId: new ObjectId(data.patientId),
        doctorId: new ObjectId(data.doctorId),
        date: new Date(data.date),
        createdAt: date,
        updatedAt: date,
      };

      await db.collection("consultations").insertOne(consultationData);

      res.status(201).json({ message: "Consultation ajoutée avec succès" });
    } catch (error: any) {
      console.error("Erreur lors de l'ajout :", error);
      res.status(500).json({ error: "Erreur lors de l'ajout de la consultation" });
    }
  });

export default handler;
