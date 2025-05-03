import { MongoClient, Db } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const uri = process.env.MONGODB_URI as string;
const options = {};

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

const client = new MongoClient(uri, options);
const clientPromise = client.connect();

interface RequestWithDb extends NextApiRequest {
  dbClient: MongoClient;
  db: Db;
}

export default async function database(
  req: RequestWithDb,
  res: NextApiResponse,
  next: () => void
) {
  try {
    req.dbClient = await clientPromise;
    req.db = req.dbClient.db();
    return next();
  } catch (e) {
    console.error("Failed to connect to the database", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
