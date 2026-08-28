"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reservationSchema,
  type ReservationFormInput,
  type ReservationInput,
} from "@/lib/validations/reservation.schema";
import { createReservation } from "@/lib/actions/reservation.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";

function generateTimeSlots() {
  const slots: string[] = [];
  for (let minutes = 11 * 60; minutes <= 22 * 60 + 30; minutes += 30) {
    const h = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const m = (minutes % 60).toString().padStart(2, "0");
    slots.push(`${h}:${m}`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function todayISODate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
}

export function ReservationForm({ maxPartySize }: { maxPartySize: number }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReservationFormInput, unknown, ReservationInput>({
    resolver: zodResolver(reservationSchema(maxPartySize)),
  });

  const onSubmit = (data: ReservationInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createReservation(data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setSubmitted(true);
      reset();
    });
  };

  if (submitted) {
    return (
      <div role="status" className="rounded-lg border border-success/30 bg-success/10 p-6 text-center">
        <p className="font-display text-lg font-semibold text-foreground">Reservation request received</p>
        <p className="mt-2 text-sm text-muted">
          We&apos;ll confirm your table shortly by phone or email. Thank you!
        </p>
        <Button variant="outline" className="mt-4" onClick={() => setSubmitted(false)}>
          Make another reservation
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" autoComplete="name" {...register("name")} />
          <FieldError>{errors.name?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...register("phone")} />
          <FieldError>{errors.phone?.message}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
        <FieldError>{errors.email?.message}</FieldError>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="reservationDate">Date</Label>
          <Input
            id="reservationDate"
            type="date"
            min={todayISODate()}
            {...register("reservationDate")}
          />
          <FieldError>{errors.reservationDate?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="reservationTime">Time</Label>
          <select
            id="reservationTime"
            {...register("reservationTime")}
            defaultValue=""
            className="h-11 w-full rounded-[var(--radius)] border border-border bg-surface px-3.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-accent"
          >
            <option value="" disabled>
              Select time
            </option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          <FieldError>{errors.reservationTime?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="partySize">Guests</Label>
          <Input
            id="partySize"
            type="number"
            min={1}
            max={maxPartySize}
            {...register("partySize")}
          />
          <FieldError>{errors.partySize?.message}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="specialRequest">Special requests (optional)</Label>
        <Textarea id="specialRequest" rows={3} {...register("specialRequest")} />
        <FieldError>{errors.specialRequest?.message}</FieldError>
      </div>

      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" isLoading={isPending} className="w-full sm:w-auto">
        Request Reservation
      </Button>
    </form>
  );
}
