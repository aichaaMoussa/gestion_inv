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
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Nom d'utilisateur et mot de passe requis" });
  }

  try {
    const db = await connectToDb();
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
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

    res.status(200).json({
      token,
      id: user._id.toString(),
      username: user.username,
      roleId: user.roleId
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
