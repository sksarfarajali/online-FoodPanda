import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-guards";
import { TrackOrderForm } from "@/components/order/track-order-form";

export const metadata = { title: "Track Order" };

export default async function TrackOrderPage() {
  // Registered users already have their orders one click away with no order number/contact
  // entry required — send them there instead of the guest lookup form. Guests (and riders/admins,
  // who have their own order views) still get the manual form below.
  const user = await getCurrentUser();
  if (user && user.role === "CUSTOMER") {
    redirect("/account/orders");
  }

  return <TrackOrderForm />;
}
