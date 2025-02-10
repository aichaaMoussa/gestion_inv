import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { connectToDb } from "@/lib/mongoose";
import { userShemas } from "@/schemas/schemas";

const handler = nextConnect();
handler
  .get(async (req: any, res: NextApiResponse) => {
    try {
      const db = await connectToDb();

      const pageSize = parseInt(req.query.pageSize || "20", 10);
      const pageIndex = parseInt(req.query.pageIndex || "0", 10);

      if (isNaN(pageSize) || isNaN(pageIndex)) {
        return res.status(400).json({ message: "Paramètres invalides" });
      }

      const skip = pageIndex * pageSize;
      const pipeline = [
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: skip },
        { $limit: pageSize },
      ];

      const data = await db.collection("users").aggregate(pipeline).toArray();
      const count = await db.collection("users").countDocuments();

      console.log("Données retournées :", data);
      res.status(200).json({ roles: data, count });
    } catch (error) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error.message });
    }
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { user, body: data } = req;
    console.log("Data received in API:", data);

    if (!userShemas.safeParse(data).success)
      return res.status(400).json({ message: "invalid data" });

    try {
      const date = new Date();

      const db = await connectToDb();
      const hashedPassword = await bcrypt.hash(data.password, 10);
      data.password = hashedPassword;
      if (data?.roleId) data.roleId = new ObjectId(data?.roleId);

      await db.collection("users").insertOne({
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
