import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";

import { MedicalHistorySchema } from "@/schemas/roleshemas";
import { connectToDb } from "@/lib/mongoose";

const handler = nextConnect();

handler
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const db = await connectToDb();

      const pageSize = parseInt(req.query.pageSize as string || "20", 10);
      const pageIndex = parseInt(req.query.pageIndex as string || "0", 10);

      if (isNaN(pageSize) || isNaN(pageIndex)) {
        return res.status(400).json({ message: "Paramètres invalides" });
      }

      const skip = pageIndex * pageSize;
      const pipeline = [
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: pageSize },
      ];

      const data = await db.collection("roles").aggregate(pipeline).toArray();
      const count = await db.collection("roles").countDocuments();

      console.log("Données retournées :", data);
      res.status(200).json({ roles: data, count });
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { body: data } = req;

    if (!MedicalHistorySchema.safeParse(data).success)
      return res.status(400).json({ message: "invalid data" });

    try {
      const date = new Date();

      const db = await connectToDb();

      if (data?.departementId)
        data.departementId = new ObjectId(data?.departementId);
      if (data?.structureId) data.structureId = new ObjectId(data?.structureId);

      await db.collection("roles").insertOne({
        ...data,
        createdAt: date,
        updatedAt: date,
      });

      res.status(201).json({ message: "Group created" });
    } catch (err) {
      console.log("error", err);
      return res.status(500).json({ error: "Error creating group" });
    }
  });

export default handler;
