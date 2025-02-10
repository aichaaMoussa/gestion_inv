import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (!clientPromise) {
  try {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  } catch (error) {
    console.log("error", error);
  }
}

export let db: Db;

const connectToDb = async () => {
  try {
    console.log("Tentative de connexion à MongoDB...");
    const client = await clientPromise;
    db = client.db("medical");
    console.log("Connexion à MongoDB réussie !");
    return db;
  } catch (error) {
    console.error("Erreur lors de la connexion à MongoDB :", error);
    throw new Error("Échec de la connexion à MongoDB");
  }
};

export { connectToDb };
