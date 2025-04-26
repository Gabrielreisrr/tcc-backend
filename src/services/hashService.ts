import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "segredo_teste";

interface TokenPayload {
  id: string | any;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
