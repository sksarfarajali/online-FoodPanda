"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setCustomerActive } from "@/lib/actions/user.actions";

export interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
  _count: { orders: number; reservations: number };
}

export function CustomersManager({ customers }: { customers: CustomerRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full max-w-xs rounded-[var(--radius)] border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted"
        />
        <span className="shrink-0 text-xs text-muted">
          {filtered.length} of {customers.length} customer{customers.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Reservations</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {filtered.map((customer) => (
              <CustomerRowItem key={customer.id} customer={customer} onChanged={() => router.refresh()} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-muted">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerRowItem({
  customer,
  onChanged,
}: {
  customer: CustomerRow;
  onChanged: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-foreground">{customer.name}</td>
      <td className="px-4 py-3 text-muted">
        {customer.email}
        {customer.phone && <div className="text-xs">{customer.phone}</div>}
      </td>
      <td className="px-4 py-3 text-muted">{customer._count.orders}</td>
      <td className="px-4 py-3 text-muted">{customer._count.reservations}</td>
      <td className="px-4 py-3 text-muted">
        {new Date(customer.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            customer.isActive ? "bg-success/15 text-success" : "bg-muted/20 text-muted"
          }`}
        >
          {customer.isActive ? "Active" : "Deactivated"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await setCustomerActive(customer.id, !customer.isActive);
              onChanged();
            })
          }
          className="text-sm text-primary hover:underline disabled:opacity-50"
        >
          {customer.isActive ? "Deactivate" : "Reactivate"}
        </button>
      </td>
    </tr>
  );
}
