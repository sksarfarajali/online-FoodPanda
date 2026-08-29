import { redirect } from "next/navigation";
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
      <main className="mx-auto max-w-2xl p-5">{children}</main>
    </div>
  );
}
