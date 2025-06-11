import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { ObjectId } from "mongodb";
import { connectToDb } from "@/lib/mongoose";
import { userShemas } from "@/schemas/schemas";

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

      const data = await db.collection("users").aggregate(pipeline).toArray();
      const count = await db.collection("users").countDocuments();

      res.status(200).json({ users: data, count });
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { body: data } = req;
    console.log(data);

    if (!userShemas.safeParse(data).success) {
      return res.status(400).json({ message: "Invalid data" });
    }

    try {
      const date = new Date();
      const db = await connectToDb();

      // Vérifier si le NNI existe déjà
      if (data.nni) {
        const existingUserWithNNI = await db.collection("users").findOne({ nni: data.nni });
        if (existingUserWithNNI) {
          return res.status(400).json({ message: "Un utilisateur avec ce NNI existe déjà" });
        }
      }

      // Vérifier si le numéro de téléphone existe déjà
      if (data.phone) {
        const existingUserWithPhone = await db.collection("users").findOne({ phone: data.phone });
        if (existingUserWithPhone) {
          return res.status(400).json({ message: "Un utilisateur avec ce numéro de téléphone existe déjà" });
        }
      }

      if (data?.roleId) data.roleId = new ObjectId(data?.roleId);

      await db.collection("users").insertOne({
        ...data,
        createdAt: date,
        updatedAt: date,
      });

      res.status(201).json({ message: "User created" });
    } catch (error: unknown) {
      console.error("Erreur API :", error);
      res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
    }
  });

export default handler;
