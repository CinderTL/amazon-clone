import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/client";
import { prisma } from "./db";

const COOKIE_NAME = "mh_session";
const SESSION_DAYS = 7;

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
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

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { sellerProfile: true },
  });
}

export async function requireAuth(loginPath = "/login") {
  const session = await getSession();
  if (!session) redirect(loginPath);
  return session;
}

export async function requireSeller() {
  const session = await getSession();
  if (!session) redirect("/login?next=/seller/dashboard");
  if (session.role !== Role.SELLER && session.role !== Role.ADMIN) {
    redirect("/");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { sellerProfile: true },
  });
  if (!user?.sellerProfile) redirect("/");
  return { session, user, seller: user.sellerProfile };
}

export { COOKIE_NAME };
