import { NextApiRequest, NextApiResponse } from "next";
import nextConnect from "next-connect";
import { connectToDb } from "@/lib/mongoose";

const handler = nextConnect();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectToDb();
    res.status(200).json({ message: "Database connection successful" });
  } catch (error: unknown) {
    console.error("Erreur API :", error);
    res.status(500).json({ statusCode: 500, message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

export default handler;
