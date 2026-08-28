import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/users/users-manager";

export const metadata = { title: "Admin Users" };

export default async function AdminUsersPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "SUPER_ADMIN") redirect("/admin");

  const users = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Admin Users</h1>
      <div className="mt-6">
        <UsersManager users={users} />
      </div>
    </div>
  );
}
