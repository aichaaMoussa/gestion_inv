import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not defined. Please add it to your .env file."
  );
}

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  [key: string]: string | number | boolean | null;
}

// Extension du type NextApiRequest pour inclure la propriété user
declare module "next" {
  interface NextApiRequest {
    user?: DecodedToken;
  }
}

export function authenticate(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Accès non autorisé" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);
    if (typeof decoded === 'string' || !decoded) {
      throw new Error('Invalid token format');
    }
    req.user = decoded as DecodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Token invalide" });
  }
}
