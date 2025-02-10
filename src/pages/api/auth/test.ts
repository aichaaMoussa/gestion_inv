import { getServerSession } from "next-auth";


export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  return res.json({ session });
}
