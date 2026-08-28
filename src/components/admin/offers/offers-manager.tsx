"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { OfferForm } from "./offer-form";
import { deleteOffer } from "@/lib/actions/offer.actions";
import { Button } from "@/components/ui/button";
import type { OfferInput } from "@/lib/validations/offer.schema";

export interface OfferRow {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  discountPercent: number | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
}

export function OffersManager({ offers }: { offers: OfferRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<OfferInput | null | undefined>(undefined);

  function close() {
    setEditing(undefined);
    router.refresh();
  }

  return (
    <div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({ title: "", isActive: true, sortOrder: 0 })}>
          <Plus className="h-4 w-4" /> New Offer
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer) => (
          <div key={offer.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-foreground">{offer.title}</h3>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  offer.isActive ? "bg-success/15 text-success" : "bg-muted/20 text-muted"
                }`}
              >
                {offer.isActive ? "Active" : "Hidden"}
              </span>
            </div>
            {offer.description && <p className="mt-1 text-sm text-muted">{offer.description}</p>}
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setEditing({
                    id: offer.id,
                    title: offer.title,
                    description: offer.description ?? "",
                    code: offer.code ?? "",
                    discountPercent: offer.discountPercent ?? undefined,
                    startsAt: offer.startsAt ?? "",
                    endsAt: offer.endsAt ?? "",
                    isActive: offer.isActive,
                    sortOrder: 0,
                  })
                }
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <ConfirmDeleteButton onConfirm={() => deleteOffer(offer.id)} />
            </div>
          </div>
        ))}
        {offers.length === 0 && <p className="text-sm text-muted">No offers yet.</p>}
      </div>

      {editing !== undefined && (
        <Modal title={editing?.id ? "Edit Offer" : "New Offer"} onClose={close}>
          <OfferForm initial={editing ?? undefined} onSaved={close} />
        </Modal>
      )}
    </div>
  );
}
