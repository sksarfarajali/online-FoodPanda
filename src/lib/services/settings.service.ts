import { prisma } from "@/lib/prisma";

/** Restaurant settings are always a single row. Falls back to seed defaults if somehow missing. */
export async function getSettings() {
  const settings = await prisma.restaurantSettings.findUnique({
    where: { id: "singleton" },
  });

  if (settings) return settings;

  return prisma.restaurantSettings.create({ data: { id: "singleton" } });
}
