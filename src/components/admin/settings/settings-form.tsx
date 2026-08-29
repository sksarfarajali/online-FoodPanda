"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingsSchema,
  type SettingsFormInput,
  type SettingsInput,
} from "@/lib/validations/settings.schema";
import { saveSettings } from "@/lib/actions/settings.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { ImageUploader } from "@/components/admin/image-uploader";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export function SettingsForm({ initial }: { initial: SettingsInput }) {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormInput, unknown, SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...initial,
      openingHours:
        initial.openingHours && initial.openingHours.length > 0
          ? initial.openingHours
          : DAYS.map((day) => ({ day, opens: "11:00", closes: "23:00", closed: false })),
    },
  });

  const { fields } = useFieldArray({ control, name: "openingHours" });
  const logoUrl = watch("logoUrl");

  const onSubmit = (data: SettingsInput) => {
    setFormError(null);
    startTransition(async () => {
      const result = await saveSettings(data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setSavedAt(Date.now());
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Section title="Identity">
        <div>
          <Label htmlFor="restaurantName">Restaurant name</Label>
          <Input id="restaurantName" {...register("restaurantName")} />
          <FieldError>{errors.restaurantName?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" {...register("tagline")} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </div>
        <div>
          <Label>Logo</Label>
          <ImageUploader entity="settings" value={logoUrl} onChange={(url) => setValue("logoUrl", url)} />
        </div>
      </Section>

      <Section title="Address & Location">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="addressLine1">Address line 1</Label>
            <Input id="addressLine1" {...register("addressLine1")} />
          </div>
          <div>
            <Label htmlFor="addressLine2">Address line 2</Label>
            <Input id="addressLine2" {...register("addressLine2")} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
          </div>
          <div>
            <Label htmlFor="postalCode">Postal code</Label>
            <Input id="postalCode" {...register("postalCode")} />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
          </div>
        </div>
        <div>
          <Label htmlFor="googleMapsEmbedUrl">Google Maps embed URL</Label>
          <Input
            id="googleMapsEmbedUrl"
            placeholder="https://www.google.com/maps/embed?..."
            {...register("googleMapsEmbedUrl")}
          />
        </div>
      </Section>

      <Section title="Contact">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phonePrimary">Primary phone</Label>
            <Input id="phonePrimary" {...register("phonePrimary")} />
          </div>
          <div>
            <Label htmlFor="phoneSecondary">Secondary phone</Label>
            <Input id="phoneSecondary" {...register("phoneSecondary")} />
          </div>
          <div>
            <Label htmlFor="whatsappNumber">WhatsApp number</Label>
            <Input id="whatsappNumber" {...register("whatsappNumber")} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
          </div>
        </div>
      </Section>

      <Section title="Social Links">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="facebookUrl">Facebook</Label>
            <Input id="facebookUrl" {...register("facebookUrl")} />
          </div>
          <div>
            <Label htmlFor="instagramUrl">Instagram</Label>
            <Input id="instagramUrl" {...register("instagramUrl")} />
          </div>
          <div>
            <Label htmlFor="twitterUrl">Twitter / X</Label>
            <Input id="twitterUrl" {...register("twitterUrl")} />
          </div>
          <div>
            <Label htmlFor="youtubeUrl">YouTube</Label>
            <Input id="youtubeUrl" {...register("youtubeUrl")} />
          </div>
        </div>
      </Section>

      <Section title="Opening Hours">
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[100px_1fr_1fr_auto] items-center gap-2">
              <span className="text-sm text-foreground">{field.day}</span>
              <Input type="time" {...register(`openingHours.${index}.opens`)} />
              <Input type="time" {...register(`openingHours.${index}.closes`)} />
              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input type="checkbox" {...register(`openingHours.${index}.closed`)} /> Closed
              </label>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Ordering & Payments">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" {...register("currency")} />
          </div>
          <div>
            <Label htmlFor="taxPercent">Tax %</Label>
            <Input id="taxPercent" type="number" step="0.01" {...register("taxPercent")} />
          </div>
          <div>
            <Label htmlFor="deliveryFee">Delivery fee</Label>
            <Input id="deliveryFee" type="number" step="0.01" {...register("deliveryFee")} />
          </div>
          <div>
            <Label htmlFor="freeDeliveryAbove">Free delivery above</Label>
            <Input id="freeDeliveryAbove" type="number" step="0.01" {...register("freeDeliveryAbove")} />
          </div>
          <div>
            <Label htmlFor="minOrderAmount">Minimum order amount</Label>
            <Input id="minOrderAmount" type="number" step="0.01" {...register("minOrderAmount")} />
          </div>
          <div>
            <Label htmlFor="maxPartySize">Max reservation party size</Label>
            <Input id="maxPartySize" type="number" {...register("maxPartySize")} />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" {...register("deliveryEnabled")} /> Delivery enabled
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" {...register("pickupEnabled")} /> Pickup enabled
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" {...register("codEnabled")} /> Cash on delivery / pickup enabled
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" {...register("reservationEnabled")} /> Reservations enabled
          </label>
        </div>
      </Section>

      <Section title="SEO">
        <div>
          <Label htmlFor="metaTitle">Meta title</Label>
          <Input id="metaTitle" {...register("metaTitle")} />
        </div>
        <div>
          <Label htmlFor="metaDescription">Meta description</Label>
          <Textarea id="metaDescription" rows={2} {...register("metaDescription")} />
        </div>
      </Section>

      {formError && <p className="text-sm text-danger">{formError}</p>}
      {savedAt && <p className="text-sm text-success">Settings saved.</p>}

      <Button type="submit" isLoading={isPending}>
        Save Settings
      </Button>
    </form>
  );
}
