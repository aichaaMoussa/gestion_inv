import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDb } from "@/lib/mongoose";

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined. Please add it to your .env file."
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Login API called with method:", req.method);
  console.log("Request headers:", req.headers);
  
  if (req.method !== "POST") {
    console.log("Method not allowed:", req.method);
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { username, password } = req.body;
  console.log("Login attempt for username:", username);

  if (!username || !password) {
    console.log("Missing credentials");
    return res
      .status(400)
      .json({ message: "Nom d'utilisateur et mot de passe requis" });
  }

  try {
    console.log("Connecting to database...");
    const db = await connectToDb();
    console.log("Database connected successfully");

    const user = await db.collection("users").findOne({ username });
    console.log("User lookup result:", user ? "User found" : "User not found");

    if (!user) {
      console.log("User not found:", username);
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password validation result:", isPasswordValid ? "Valid" : "Invalid");

    if (!isPasswordValid) {
      console.log("Invalid password for user:", username);
      return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Générer un token JWT avec l'ID correct
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        username: user.username, 
        roleId: user.roleId 
      },
      JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    console.log("Login successful for user:", username);
    res.status(200).json({
      token,
      id: user._id.toString(),
      username: user.username,
      roleId: user.roleId
    });
  } catch (error) {
    console.error("Login error details:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      headers: req.headers
    });
    res.status(500).json({ 
      message: "Erreur serveur",
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    });
  }
}
