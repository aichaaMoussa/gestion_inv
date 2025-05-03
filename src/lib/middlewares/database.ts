import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const uri = process.env.MONGODB_URI as string; // Assurez-vous que l'URI MongoDB est dans vos variables d'environnement
const options = {};

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

if (process.env.NODE_ENV === "development") {
  // Pour éviter de créer une nouvelle instance à chaque fois en développement
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En production, une instance unique suffit
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

interface RequestWithDb extends NextApiRequest {
  dbClient: MongoClient;
  db: any;
}

export default async function database(
  req: RequestWithDb,
  res: NextApiResponse,
  next: () => void
) {
  if (!clientPromise) {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  try {
    req.dbClient = await clientPromise;
    req.db = req.dbClient.db(); // Remplacez `db()` par votre nom de base de données si nécessaire
    return next();
  } catch (e) {
    console.error("Failed to connect to the database", e);
    return res.status(500).json({ message: "Internal server error" });
  }
}
