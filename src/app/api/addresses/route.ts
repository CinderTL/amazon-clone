import { z } from "zod";
import { handleApiError, jsonOk, jsonError, readJson } from "@/lib/api";
import { requireApiSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await requireApiSession();
    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return jsonOk({ addresses });
  } catch (error) {
    return handleApiError(error);
  }
}

const schema = z.object({
  label: z.string().default("Home"),
  fullName: z.string().min(2),
  line1: z.string().min(2),
  line2: z.string().optional().nullable(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(3),
  country: z.string().default("United States"),
  phone: z.string().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSession();
    const body = schema.parse(await readJson(request));
    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }
    const address = await prisma.address.create({
      data: { ...body, userId: session.userId, isDefault: body.isDefault ?? false },
    });
    return jsonOk({ address }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireApiSession();
    const body = z
      .object({ id: z.string() })
      .merge(schema.partial())
      .parse(await readJson(request));
    const existing = await prisma.address.findFirst({
      where: { id: body.id, userId: session.userId },
    });
    if (!existing) return jsonError("Not found", 404);
    const { id, ...data } = body;
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.userId },
        data: { isDefault: false },
      });
    }
    const address = await prisma.address.update({ where: { id }, data });
    return jsonOk({ address });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireApiSession();
    const { id } = z.object({ id: z.string() }).parse(await readJson(request));
    const existing = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) return jsonError("Not found", 404);
    await prisma.address.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
