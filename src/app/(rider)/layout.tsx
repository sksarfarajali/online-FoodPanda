import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-guards";
import { signOut } from "@/lib/auth";

export default async function RiderLayout({ children }: { children: React.ReactNode }) {
  // Real gate. Proxy only redirects for UX — this is what actually protects rendering.
  const user = await getCurrentUser();
  if (!user || user.role !== "DELIVERY_RIDER") {
    redirect("/login?callbackUrl=/rider");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-4">
        <div>
          <span className="font-display text-lg font-semibold text-primary">Swaad-e-Mehfil</span>
          <p className="text-xs text-muted">Rider · {user.name}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-[var(--radius)] px-3 py-2 text-sm text-foreground hover:bg-background"
          >
            Log out
          </button>
        </form>
      </header>
      <nav className="flex gap-1 border-b border-border bg-surface px-5 py-2">
        <Link
          href="/rider"
          className="rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
        >
          Deliveries
        </Link>
        <Link
          href="/rider/history"
          className="rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
        >
          My Dashboard
        </Link>
      </nav>
      <main className="mx-auto max-w-2xl p-5">{children}</main>
    </div>
  );
}
