import Link from "next/link";
import { Phone } from "lucide-react";
import { getSettings } from "@/lib/services/settings.service";
import { getCurrentUser } from "@/lib/auth-guards";
import { MobileNav } from "./mobile-nav";
import { CartBadge } from "@/components/cart/cart-badge";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/menu", label: "Menu" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reservations", label: "Reservations" },
  { href: "/offers", label: "Offers" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  const [settings, user] = await Promise.all([getSettings(), getCurrentUser()]);

  const accountHref =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? "/admin"
      : user
        ? "/account"
        : "/login";
  const accountLabel =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
      ? "Admin"
      : user
        ? "Account"
        : "Log in";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold text-primary">
          {settings.restaurantName}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {settings.phonePrimary && (
            <a
              href={`tel:${settings.phonePrimary}`}
              className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {settings.phonePrimary}
            </a>
          )}
          <Link href={accountHref} className="text-sm font-medium text-foreground hover:text-primary">
            {accountLabel}
          </Link>
          <CartBadge />
          <Link
            href="/menu"
            className="inline-flex h-9 items-center justify-center rounded-[var(--radius)] bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Order Now
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <CartBadge />
          {settings.phonePrimary && (
            <a
              href={`tel:${settings.phonePrimary}`}
              aria-label={`Call ${settings.phonePrimary}`}
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] text-foreground hover:bg-background"
            >
              <Phone className="h-5 w-5" aria-hidden="true" />
            </a>
          )}
          <MobileNav
            navItems={[...NAV_ITEMS, { href: accountHref, label: accountLabel }]}
            phone={settings.phonePrimary}
          />
        </div>
      </div>
    </header>
  );
}
