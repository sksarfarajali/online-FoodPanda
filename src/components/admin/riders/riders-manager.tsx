"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { createRiderSchema, type CreateRiderInput } from "@/lib/validations/rider.schema";
import { createRiderAccount, setRiderActive } from "@/lib/actions/rider.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export interface RiderRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  vehicleNumber: string | null;
  isActive: boolean;
  isOnDuty: boolean;
}

export function RidersManager({ riders }: { riders: RiderRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Rider
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Duty</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {riders.map((rider) => (
              <RiderRowItem key={rider.id} rider={rider} onChanged={() => router.refresh()} />
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <Modal title="New Rider" onClose={() => setCreating(false)}>
          <CreateRiderForm
            onSaved={() => {
              setCreating(false);
              router.refresh();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

function RiderRowItem({ rider, onChanged }: { rider: RiderRow; onChanged: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-foreground">{rider.name}</td>
      <td className="px-4 py-3 text-muted">
        {rider.email}
        {rider.phone && <div className="text-xs">{rider.phone}</div>}
      </td>
      <td className="px-4 py-3 text-muted">{rider.vehicleNumber || "—"}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            rider.isOnDuty ? "bg-success/15 text-success" : "bg-muted/20 text-muted"
          }`}
        >
          {rider.isOnDuty ? "On duty" : "Off duty"}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            rider.isActive ? "bg-success/15 text-success" : "bg-muted/20 text-muted"
          }`}
        >
          {rider.isActive ? "Active" : "Deactivated"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await setRiderActive(rider.id, !rider.isActive);
              onChanged();
            })
          }
          className="text-sm text-primary hover:underline"
        >
          {rider.isActive ? "Deactivate" : "Reactivate"}
        </button>
      </td>
    </tr>
  );
}

function CreateRiderForm({ onSaved }: { onSaved: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRiderInput>({ resolver: zodResolver(createRiderSchema) });

  const onSubmit = (data: CreateRiderInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createRiderAccount(data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      onSaved();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        <FieldError>{errors.email?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" {...register("phone")} />
        <FieldError>{errors.phone?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="vehicleNumber">Vehicle number</Label>
        <Input id="vehicleNumber" {...register("vehicleNumber")} />
        <FieldError>{errors.vehicleNumber?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">Temporary password</Label>
        <Input id="password" type="password" {...register("password")} />
        <FieldError>{errors.password?.message}</FieldError>
      </div>
      {formError && <p className="text-sm text-danger">{formError}</p>}
      <Button type="submit" isLoading={isPending} className="w-full">
        Create Rider
      </Button>
    </form>
  );
}
