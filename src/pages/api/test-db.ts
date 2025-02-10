import { NextApiRequest, NextApiResponse } from "next";
import connectMongo from "../../lib/mongoose";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    await connectMongo();

    res.status(200).json({
      message: "Connexion à MongoDB réussie avec Mongoose",
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Erreur lors de la connexion à MongoDB avec Mongoose",
      error: error.message,
    });
  }
};

export default handler;
