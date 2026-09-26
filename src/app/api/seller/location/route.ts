import { z } from "zod";
import { ApiError, handleApiError, jsonOk, readJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { requireApiSeller } from "@/lib/session";
import { getSellerForUser } from "@/services/seller";

const schema = z.object({
  latitude: z.number().gte(-90).lte(90),
  longitude: z.number().gte(-180).lte(180),
});

export async function POST(request: Request) {
  try {
    const session = await requireApiSeller();
    const seller = await getSellerForUser(session.userId);
    const { latitude, longitude } = schema.parse(await readJson(request));
    const url = new URL("https://api.bigdatacloud.net/data/reverse-geocode-client");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("localityLanguage", "en");

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new ApiError("Could not determine your country from this location", 502);
    const data = (await response.json()) as { countryName?: string; countryCode?: string };
    const country = data.countryName?.trim();
    const countryCode = data.countryCode?.trim();
    if (!country || !countryCode) throw new ApiError("Could not determine your country from this location", 502);

    await prisma.sellerProfile.update({
      where: { id: seller.id },
      data: { originCountry: country, originCountryCode: countryCode },
    });

    return jsonOk({ country, countryCode });
  } catch (error) {
    return handleApiError(error);
  }
}
