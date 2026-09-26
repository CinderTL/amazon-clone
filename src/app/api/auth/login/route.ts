import { z } from "zod";
import { handleApiError, jsonError, jsonOk, readJson } from "@/lib/api";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await readJson(request));
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { sellerProfile: true },
    });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return jsonOk({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sellerProfile: user.sellerProfile,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
