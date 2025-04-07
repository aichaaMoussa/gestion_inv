import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { connectToDb } from "@/lib/mongoose";
import { PatientSchema, userShemas } from "@/schemas/schemas";

const handler = nextConnect();

handler
  .get(async (req: any, res: NextApiResponse) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    try {
      const db = await connectToDb();

      const patients = await db
        .collection("patients")
        .findOne({ _id: new ObjectId(id as string) });
      if (!patients) {
        return res.status(404).json({ error: "patient not fond" });
      }
      console.log("patients", patients);
      res.json(patients);
    } catch (error) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, error });
    }
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    console.log("ID reçu pour mise à jour:", id);

    if (!ObjectId.isValid(id as string)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
      if (!id) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const date = new Date();
      const updatedData = { ...req.body, updatedAt: date };
     
      // Convertir roleId en ObjectId
      if (updatedData.roleId) {
        updatedData.roleId = new ObjectId(updatedData.roleId);
      }
      const db = await connectToDb();
      const user = await db
        .collection("patients")
        .findOne({ _id: new ObjectId(id as string) });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log("Données reçues pour mise à jour:", req.body); // Debug des données reçues
      const validation = PatientSchema.safeParse(req.body);
      if (!validation.success) {
        console.log("Erreur validation:", validation.error);
        return res
          .status(400)
          .json({ message: "Invalid data", errors: validation.error });
      }

      const result = await db
        .collection("patients")
        .updateOne({ _id: new ObjectId(id as string) }, { $set: updatedData });

      console.log("Résultat de la mise à jour:", result);

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "patient not found" });
      }

      res.status(200).json({ message: "patient updated successfully" });
    } catch (error) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, error: "Erreur serveur" });
    }
  })

  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const db = await connectToDb();
      const result = await db
        .collection("patients")
        .deleteOne({ _id: new ObjectId(id as string) });

      res.status(200).json({ message: "patients deleted successfully" });
    } catch (error) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  });

export default handler;
