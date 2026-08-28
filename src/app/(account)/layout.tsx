import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth-guards";
import { signOut } from "@/lib/auth";

const NAV_ITEMS = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/reservations", label: "Reservations" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/account");

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
            <aside>
              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium text-foreground hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
                className="mt-2"
              >
                <button
                  type="submit"
                  className="w-full rounded-[var(--radius)] px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-surface"
                >
                  Log out
                </button>
              </form>
            </aside>
            <div>{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
