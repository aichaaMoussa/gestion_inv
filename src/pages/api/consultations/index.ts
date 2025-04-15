import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import { connectToDb } from "@/lib/mongoose";
import { consultationSchema } from "@/schemas/consultation";

const handler = nextConnect();

handler
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { user } = req.query;

    if (!user) {
      return res.status(400).json({ message: "Utilisateur non fourni" });
    }

    try {
      const db = await connectToDb();
      const doctorId = new ObjectId(user as string);

      const pageSize = parseInt((req.query.pageSize as string) || "20", 10);
      const pageIndex = parseInt((req.query.pageIndex as string) || "0", 10);

      if (isNaN(pageSize) || isNaN(pageIndex)) {
        return res.status(400).json({ message: "Paramètres invalides" });
      }

      const skip = pageIndex * pageSize;
      const pipeline = [
        { $match: { doctorId } },
        { $sort: { dateConsultation: -1, _id: -1 } },
        { $skip: skip },
        { $limit: pageSize },
      ];

      const data = await db
        .collection("consultations")
        .aggregate(pipeline)
        .toArray();
      const count = await db
        .collection("consultations")
        .countDocuments({ doctorId });

      console.log("Données consultations retournées :", data);
      res.status(200).json({ consultations: data, count });
    } catch (error) {
      console.error("Erreur API consultations :", error);
      res.status(500).json({ statusCode: 500, message: "Erreur serveur" });
    }
  })

  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { body: data } = req;
      console.log("Données consultation reçues pour insertion :", data);

      if (!data.doctorId) {
        return res
          .status(400)
          .json({ message: "Utilisateur non fourni (doctorId manquant)" });
      }

      // Convertir les dates en objets Date
      const consultationData = {
        ...data,
        dateConsultation: new Date(data.dateConsultation),
        dateRendezVous: data.dateRendezVous ? new Date(data.dateRendezVous) : null,
      };

      if (!consultationSchema.safeParse(consultationData).success) {
        return res.status(400).json({ message: "Données invalides" });
      }

      const db = await connectToDb();
      const date = new Date();
      const doctorId = new ObjectId(data.doctorId);
      const patientId = new ObjectId(data.patientId);

      await db.collection("consultations").insertOne({
        ...consultationData,
        doctorId,
        patientId,
        createdAt: date,
        updatedAt: date,
      });

      res.status(201).json({ message: "Consultation ajoutée avec succès" });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la consultation :", error);
      res.status(500).json({ error: "Erreur lors de l'ajout de la consultation" });
    }
  });

export default handler;
