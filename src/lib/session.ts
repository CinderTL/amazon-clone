import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Role } from "@/generated/prisma/client";
import { COOKIE_NAME, type SessionPayload } from "./auth";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function getApiSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function requireApiSession() {
  const session = await getApiSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireApiSeller() {
  const session = await requireApiSession();
  if (session.role !== Role.SELLER && session.role !== Role.ADMIN) {
    throw new Error("FORBIDDEN");
  }
  return session;
}
