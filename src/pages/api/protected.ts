import { authenticate } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  authenticate(req, res, () => {
    res
      .status(200)
      .json({ message: "Route protégée accessible", user: req.user });
  });
}
