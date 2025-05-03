import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";

import { MedicalHistorySchema } from "@/schemas/roleshemas";
import { connectToDb } from "@/lib/mongoose";

const handler = nextConnect();

handler
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    try {
      const db = await connectToDb();

      const roles = await db
        .collection("roles")
        .findOne({ _id: new ObjectId(id as string) });
      if (!roles) {
        return res.status(404).json({ error: "role not fond" });
      }
      res.json(roles);
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  })
  .put(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    try {
      if (!id) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const db = await connectToDb();
      const roles = await db
        .collection("roles")
        .findOne({ _id: new ObjectId(id as string) });
      if (!roles) {
        return res.status(404).json({ error: "role not fond" });
      }
      if (!MedicalHistorySchema.safeParse(req.body).success) {
        return res.status(400).json({ message: "Invalid data" });
      }

      await db
        .collection("roles")
        .updateOne(
          { _id: new ObjectId(id as string) },
          { $set: { ...req.body, updatedAt: new Date() } }
        );

      res.status(200).json({ message: "Role updated successfully" });
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
        .collection("roles")
        .deleteOne({ _id: new ObjectId(id as string) });

      res.status(200).json({ message: "Role deleted successfully" });
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  });

export default handler;
