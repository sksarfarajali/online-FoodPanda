"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";

export function MobileNav({
  navItems,
  phone,
}: {
  navItems: { href: string; label: string }[];
  phone?: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-[var(--radius)] text-foreground hover:bg-background"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-lg"
        >
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius)] px-3 py-3 text-base text-foreground hover:bg-background"
              >
                {item.label}
              </Link>
            ))}
            {phone && (
              <a
                href={`tel:${phone}`}
                className="mt-2 flex items-center gap-2 rounded-[var(--radius)] bg-primary px-3 py-3 text-base font-medium text-primary-foreground"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Call {phone}
              </a>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
