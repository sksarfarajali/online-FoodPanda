"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { createAdminSchema, type CreateAdminInput } from "@/lib/validations/auth.schema";
import { createAdmin, setAdminActive } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import type { Role } from "@/generated/prisma/enums";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export function UsersManager({ users }: { users: AdminUserRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  return (
    <div>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> New Admin
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {users.map((user) => (
              <UserRow key={user.id} user={user} onChanged={() => router.refresh()} />
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <Modal title="New Admin" onClose={() => setCreating(false)}>
          <CreateAdminForm
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

function UserRow({ user, onChanged }: { user: AdminUserRow; onChanged: () => void }) {
  const [isPending, startTransition] = useTransition();

  return (
    <tr>
      <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
      <td className="px-4 py-3 text-muted">{user.email}</td>
      <td className="px-4 py-3 text-muted">{user.role}</td>
      <td className="px-4 py-3">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            user.isActive ? "bg-success/15 text-success" : "bg-muted/20 text-muted"
          }`}
        >
          {user.isActive ? "Active" : "Deactivated"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {user.role !== "SUPER_ADMIN" && (
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await setAdminActive(user.id, !user.isActive);
                onChanged();
              })
            }
            className="text-sm text-primary hover:underline"
          >
            {user.isActive ? "Deactivate" : "Reactivate"}
          </button>
        )}
      </td>
    </tr>
  );
}

function CreateAdminForm({ onSaved }: { onSaved: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdminInput>({ resolver: zodResolver(createAdminSchema) });

  const onSubmit = (data: CreateAdminInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createAdmin(data);
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
        <Label htmlFor="password">Temporary password</Label>
        <Input id="password" type="password" {...register("password")} />
        <FieldError>{errors.password?.message}</FieldError>
      </div>
      {formError && <p className="text-sm text-danger">{formError}</p>}
      <Button type="submit" isLoading={isPending} className="w-full">
        Create Admin
      </Button>
    </form>
  );
}
