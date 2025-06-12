import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import { connectToDb } from "@/lib/mongoose";
import { PatientSchema } from "@/schemas/schemas";

const handler = nextConnect();

handler
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { user } = req.query; // user doit être passé dans la requête

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
        { $match: { doctorId } }, // Filtrer les patients par doctorId
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: pageSize },
      ];

      const data = await db
        .collection("patients")
        .aggregate(pipeline)
        .toArray();
      const count = await db
        .collection("patients")
        .countDocuments({ doctorId });

      console.log("Données retournées :", data);
      res.status(200).json({ roles: data, count });
    } catch (error: any) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  })

  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { body: data } = req;
      console.log("Données reçues pour insertion :", data);

      if (!data.doctorId) {
        return res
          .status(400)
          .json({ message: "Utilisateur non fourni (doctorId manquant)" });
      }

      if (!PatientSchema.safeParse(data).success) {
        return res.status(400).json({ message: "Données invalides" });
      }

      const db = await connectToDb();
      const date = new Date();
      const doctorId = new ObjectId(data.doctorId);
      if (data.nni) {
        const existingUserWithNNI = await db.collection("patients").findOne({ nni: data.nni });
        if (existingUserWithNNI) {
          return res.status(400).json({ message: "Un patient avec ce NNI existe déjà" });
        }
      }

      // Vérifier si le numéro de téléphone existe déjà
      if (data.telephone) {
        const existingUserWithPhone = await db.collection("patients").findOne({ phone: data.phone });
        if (existingUserWithPhone) {
          return res.status(400).json({ message: "Un patient avec ce numéro de téléphone existe déjà" });
        }
      }
      console.log("Insertion en base avec doctorId :", doctorId);

      await db.collection("patients").insertOne({
        ...data,
        doctorId, // 🔥 Associer le patient au médecin
        createdAt: date,
        updatedAt: date,
      });

      res.status(201).json({ message: "Patient ajouté avec succès" });
    } catch (error: any) {
      console.error("Erreur lors de l'ajout :", error);
      res.status(500).json({ error: "Erreur lors de l'ajout du patient" });
    }
  });
export default handler;
