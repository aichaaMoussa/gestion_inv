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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "ID de la consultation non fourni" });
    }

    try {
      const db = await connectToDb();
      const consultationId = new ObjectId(id as string);

      const consultation = await db
        .collection("consultations")
        .findOne({ _id: consultationId });

      if (!consultation) {
        return res.status(404).json({ message: "Consultation non trouvée" });
      }

      res.status(200).json(consultation);
    } catch (error: any) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    const data = req.body;

    if (!id) {
      return res.status(400).json({ message: "ID de la consultation non fourni" });
    }

    if (!ConsultationSchema.safeParse(data).success) {
      return res.status(400).json({ message: "Données invalides" });
    }

    try {
      const db = await connectToDb();
      const consultationId = new ObjectId(id as string);
      const date = new Date();

      const consultationData = {
        ...data,
        patientId: new ObjectId(data.patientId),
        doctorId: new ObjectId(data.doctorId),
        date: new Date(data.date),
        updatedAt: date,
      };

      const result = await db
        .collection("consultations")
        .updateOne(
          { _id: consultationId },
          { $set: consultationData }
        );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Consultation non trouvée" });
      }

      res.status(200).json({ message: "Consultation mise à jour avec succès" });
    } catch (error: any) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  })
  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "ID de la consultation non fourni" });
    }

    try {
      const db = await connectToDb();
      const consultationId = new ObjectId(id as string);

      const result = await db
        .collection("consultations")
        .deleteOne({ _id: consultationId });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Consultation non trouvée" });
      }

      res.status(200).json({ message: "Consultation supprimée avec succès" });
    } catch (error: any) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  });

export default handler;
