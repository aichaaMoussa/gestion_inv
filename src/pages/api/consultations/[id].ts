import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import { connectToDb } from "@/lib/mongoose";
import { consultationSchema } from "@/schemas/consultation";

const handler = nextConnect();

handler
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    try {
      const db = await connectToDb();

      const consultation = await db
        .collection("consultations")
        .findOne({ _id: new ObjectId(id as string) });
      if (!consultation) {
        return res.status(404).json({ error: "Consultation not found" });
      }
      res.json(consultation);
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
      const updatedData = { 
        ...req.body, 
        updatedAt: date,
        dateConsultation: new Date(req.body.dateConsultation),
        dateRendezVous: req.body.dateRendezVous ? new Date(req.body.dateRendezVous) : null
      };
     
      if (updatedData.patientId) {
        updatedData.patientId = new ObjectId(updatedData.patientId);
      }
      
      if (updatedData.doctorId) {
        updatedData.doctorId = new ObjectId(updatedData.doctorId);
      }
      
      const db = await connectToDb();
      const consultation = await db
        .collection("consultations")
        .findOne({ _id: new ObjectId(id as string) });

      if (!consultation) {
        return res.status(404).json({ error: "Consultation not found" });
      }

      const validation = consultationSchema.safeParse({
        ...req.body,
        dateConsultation: new Date(req.body.dateConsultation),
        dateRendezVous: req.body.dateRendezVous ? new Date(req.body.dateRendezVous) : null
      });
      
      if (!validation.success) {
        console.log("Erreur validation:", validation.error);
        return res
          .status(400)
          .json({ message: "Invalid data", errors: validation.error });
      }

      await db
        .collection("consultations")
        .updateOne({ _id: new ObjectId(id as string) }, { $set: updatedData });

      res.status(200).json({ message: "Consultation updated successfully" });
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
        .collection("consultations")
        .deleteOne({ _id: new ObjectId(id as string) });

      res.status(200).json({ message: "Consultation deleted successfully" });
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  });

export default handler;
