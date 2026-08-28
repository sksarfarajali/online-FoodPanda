import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Idempotent seed: safe to re-run. Populates structural scaffolding only —
// no fabricated restaurant facts, offers, reviews, or gallery images.
// Real content is entered via the Admin dashboard / first-run setup wizard.

const PLACEHOLDER_NOTE =
  "[PLACEHOLDER] Replace this in Admin → Settings before launch.";

async function seedSettings() {
  await prisma.restaurantSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      restaurantName: "Swaad-e-Mehfil",
      tagline: PLACEHOLDER_NOTE,
      description: PLACEHOLDER_NOTE,
      country: "India",
      currency: "INR",
      taxPercent: 5.0,
      deliveryFee: 40,
      minOrderAmount: 150,
      maxPartySize: 12,
      deliveryEnabled: true,
      pickupEnabled: true,
      reservationEnabled: true,
      metaTitle: "Swaad-e-Mehfil",
      metaDescription: PLACEHOLDER_NOTE,
    },
  });
}

type SeedItem = {
  name: string;
  slug: string;
  description: string;
  price: number;
  isVeg: boolean;
};

type SeedCategory = {
  name: string;
  slug: string;
  sortOrder: number;
  items: SeedItem[];
};

// Generic, clearly-placeholder multi-cuisine-Indian scaffold. Admin replaces via dashboard.
const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: "Starters",
    slug: "starters",
    sortOrder: 1,
    items: [
      {
        name: "Paneer Tikka",
        slug: "paneer-tikka",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 220,
        isVeg: true,
      },
      {
        name: "Chicken Seekh Kebab",
        slug: "chicken-seekh-kebab",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 280,
        isVeg: false,
      },
    ],
  },
  {
    name: "Main Course",
    slug: "main-course",
    sortOrder: 2,
    items: [
      {
        name: "Paneer Butter Masala",
        slug: "paneer-butter-masala",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 260,
        isVeg: true,
      },
      {
        name: "Butter Chicken",
        slug: "butter-chicken",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 320,
        isVeg: false,
      },
    ],
  },
  {
    name: "Rice & Biryani",
    slug: "rice-and-biryani",
    sortOrder: 3,
    items: [
      {
        name: "Vegetable Biryani",
        slug: "vegetable-biryani",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 240,
        isVeg: true,
      },
      {
        name: "Chicken Biryani",
        slug: "chicken-biryani",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 300,
        isVeg: false,
      },
    ],
  },
  {
    name: "Breads",
    slug: "breads",
    sortOrder: 4,
    items: [
      {
        name: "Tandoori Roti",
        slug: "tandoori-roti",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 30,
        isVeg: true,
      },
      {
        name: "Butter Naan",
        slug: "butter-naan",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 50,
        isVeg: true,
      },
    ],
  },
  {
    name: "Desserts",
    slug: "desserts",
    sortOrder: 5,
    items: [
      {
        name: "Gulab Jamun",
        slug: "gulab-jamun",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 90,
        isVeg: true,
      },
    ],
  },
  {
    name: "Beverages",
    slug: "beverages",
    sortOrder: 6,
    items: [
      {
        name: "Masala Chai",
        slug: "masala-chai",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 40,
        isVeg: true,
      },
      {
        name: "Fresh Lime Soda",
        slug: "fresh-lime-soda",
        description: "REPLACE VIA ADMIN DASHBOARD — sample placeholder dish.",
        price: 60,
        isVeg: true,
      },
    ],
  },
];

async function seedMenu() {
  for (const category of SEED_CATEGORIES) {
    const createdCategory = await prisma.menuCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: {
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
        description: PLACEHOLDER_NOTE,
      },
    });

    for (const item of category.items) {
      await prisma.menuItem.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          categoryId: createdCategory.id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          basePrice: item.price,
          isVeg: item.isVeg,
        },
      });
    }
  }
}

async function main() {
  await seedSettings();
  await seedMenu();

  const [categoryCount, itemCount] = await Promise.all([
    prisma.menuCategory.count(),
    prisma.menuItem.count(),
  ]);

  console.log("Seed complete.");
  console.log(`  Restaurant settings: ready (edit via /setup then /admin/settings)`);
  console.log(`  Menu categories: ${categoryCount}`);
  console.log(`  Menu items: ${itemCount}`);
  console.log(
    "  Offers / Reviews / Gallery: intentionally empty (no fabricated content) — add via /admin"
  );
  console.log("\nNext step: visit /setup to create the first Super Admin account.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
