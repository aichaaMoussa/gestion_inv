import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import { connectToDb } from "@/lib/mongoose";
import { PatientSchema } from "@/schemas/schemas";

const handler = nextConnect();

handler
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
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
      res.json(patients);
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
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
     
      if (updatedData.doctorId) {
        updatedData.doctorId = new ObjectId(updatedData.doctorId);
      }
      const db = await connectToDb();
      const user = await db
        .collection("patients")
        .findOne({ _id: new ObjectId(id as string) });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const validation = PatientSchema.safeParse(req.body);
      if (!validation.success) {
        console.log("Erreur validation:", validation.error);
        return res
          .status(400)
          .json({ message: "Invalid data", errors: validation.error });
      }

      await db
        .collection("patients")
        .updateOne({ _id: new ObjectId(id as string) }, { $set: updatedData });

      res.status(200).json({ message: "patient updated successfully" });
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  })
  .delete(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Invalid ID" });
      }
      const db = await connectToDb();
      await db
        .collection("patients")
        .deleteOne({ _id: new ObjectId(id as string) });

      res.status(200).json({ message: "patients deleted successfully" });
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  });

export default handler;
