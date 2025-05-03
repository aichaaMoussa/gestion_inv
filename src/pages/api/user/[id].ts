import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { connectToDb } from "@/lib/mongoose";
import { userShemas } from "@/schemas/schemas";

const handler = nextConnect();

handler
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    try {
      const db = await connectToDb();

      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id as string) });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
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
      if (updatedData.password) {
        updatedData.password = await bcrypt.hash(updatedData.password, 10);
      }

      // Convertir roleId en ObjectId
      if (updatedData.roleId) {
        updatedData.roleId = new ObjectId(updatedData.roleId);
      }
      const db = await connectToDb();
      const user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id as string) });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      console.log("Données reçues pour mise à jour:", req.body);
      const validation = userShemas.safeParse(req.body);
      if (!validation.success) {
        console.log("Erreur validation:", validation.error);
        return res
          .status(400)
          .json({ message: "Invalid data", errors: validation.error });
      }

      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(id as string) }, { $set: updatedData });

      res.status(200).json({ message: "User updated successfully" });
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
        .collection("users")
        .deleteOne({ _id: new ObjectId(id as string) });

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  });

export default handler;
