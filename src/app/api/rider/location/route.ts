import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, AuthorizationError } from "@/lib/auth-guards";
import { updateRiderLocationSchema } from "@/lib/validations/rider.schema";

/**
 * Called from the rider's browser via navigator.geolocation.watchPosition(), not a form —
 * a plain POST endpoint fits better than a Server Action here. Writes only onto the
 * authenticated rider's own row; a userId/riderId in the body is never trusted.
 */
export async function POST(request: Request) {
  let riderId: string;
  try {
    const user = await requireRole(["DELIVERY_RIDER"]);
    riderId = user.id;
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const parsed = updateRiderLocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid location." },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: riderId },
    data: {
      currentLatitude: parsed.data.latitude,
      currentLongitude: parsed.data.longitude,
      locationUpdatedAt: new Date(),
    },
  });

  return new NextResponse(null, { status: 204 });
}
