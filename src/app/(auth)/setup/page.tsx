import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SetupForm } from "./setup-form";

export const metadata = { title: "First-run setup" };

export default async function SetupPage() {
  const superAdminCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
  if (superAdminCount > 0) {
    redirect("/login");
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-foreground">
        Welcome — let&apos;s set up your Super Admin account
      </h1>
      <p className="mt-2 text-sm text-muted">
        This one-time step creates the account that manages the whole restaurant platform.
        Further admin accounts can be created afterwards from the dashboard.
      </p>
      <div className="mt-6">
        <SetupForm />
      </div>
    </div>
  );
}
