"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setupSuperAdminSchema, type SetupSuperAdminInput } from "@/lib/validations/auth.schema";
import { setupSuperAdmin } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function SetupForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupSuperAdminInput>({
    resolver: zodResolver(setupSuperAdminSchema),
  });

  const onSubmit = (data: SetupSuperAdminInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await setupSuperAdmin(data);
      if (!result.success) {
        setFormError(result.error);
      }
      // On success, setupSuperAdmin redirects server-side to /admin.
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <Label htmlFor="name">Your name</Label>
        <Input id="name" autoComplete="name" {...register("name")} />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        <FieldError>{errors.email?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
        />
        <FieldError>{errors.password?.message}</FieldError>
      </div>
      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}
      <Button type="submit" isLoading={isPending} className="w-full">
        Create Super Admin account
      </Button>
    </form>
  );
}
