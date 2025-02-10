import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import { connectToDb } from "@/lib/mongoose";
import { userShemas } from "@/schemas/schemas";

const handler = nextConnect();

handler
  .get(async (req: any, res: NextApiResponse) => {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Invalid ID" });
    }
    try {
      const db = await connectToDb();

      const users = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id as string) });
      if (!users) {
        return res.status(404).json({ error: "role not fond" });
      }
      console.log("users", users);
      res.json(users);
    } catch (error) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, error });
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
        .collection("users")
        .findOne({ _id: new ObjectId(id as string) });
      if (!roles) {
        return res.status(404).json({ error: "role not fond" });
      }
      if (!userShemas.safeParse(req.body).success) {
        return res.status(400).json({ message: "Invalid data" });
      }

      const result = await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(id as string) },
          { $set: { ...req.body, updatedAt: new Date() } }
        );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.status(200).json({ message: "Role updated successfully" });
    } catch (error) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, error: "pas troube" });
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
        .collection("users")
        .deleteOne({ _id: new ObjectId(id as string) });

      res.status(200).json({ message: "user deleted successfully" });
    } catch (error) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  });

export default handler;
