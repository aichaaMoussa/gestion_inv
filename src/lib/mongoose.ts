import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.MONGODB_URI;
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let db: Db;

export const connectToDb = async (): Promise<Db> => {
  try {
    console.log("Tentative de connexion à MongoDB...");
    
    if (!clientPromise) {
      client = new MongoClient(uri);
      clientPromise = client.connect();
    }

    const connectedClient = await clientPromise;
    db = connectedClient.db("medical");
    console.log("Connexion à MongoDB réussie !");
    return db;
  } catch (error) {
    console.error("Erreur détaillée lors de la connexion à MongoDB :", error);
    throw new Error("Échec de la connexion à MongoDB");
  }
};

export { db };
