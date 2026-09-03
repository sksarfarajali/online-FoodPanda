import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-guards";
import { signOut } from "@/lib/auth";

const NAV_ITEMS: { href: string; label: string; superAdminOnly?: boolean }[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/menu/categories", label: "Menu Categories" },
  { href: "/admin/menu/items", label: "Menu Items" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/riders", label: "Riders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/reservations", label: "Reservations" },
  { href: "/admin/offers", label: "Offers" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/account", label: "My Account" },
  { href: "/admin/settings", label: "Settings", superAdminOnly: true },
  { href: "/admin/users", label: "Admin Users", superAdminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Real gate. Proxy only redirects for UX — this is what actually protects rendering.
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin");
  }

  const isSuperAdmin = user.role === "SUPER_ADMIN";

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 border-r border-border bg-surface">
        <div className="border-b border-border px-5 py-5">
          <span className="font-display text-lg font-semibold text-primary">
            Swaad-e-Mehfil
          </span>
          <p className="text-xs text-muted">Admin dashboard</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {NAV_ITEMS.filter((item) => !item.superAdminOnly || isSuperAdmin).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[var(--radius)] px-3 py-2 text-sm text-foreground hover:bg-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="px-3 text-xs text-muted">{user.name} · {user.role}</p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="mt-1 w-full rounded-[var(--radius)] px-3 py-2 text-left text-sm text-foreground hover:bg-background"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
