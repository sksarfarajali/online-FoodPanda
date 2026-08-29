import { getSettings } from "@/lib/services/settings.service";
import { getCurrentUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [settings, sessionUser] = await Promise.all([getSettings(), getCurrentUser()]);

  const user = sessionUser
    ? await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { name: true, email: true, phone: true },
      })
    : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-foreground">Checkout</h1>
      <p className="mt-2 text-sm text-muted">
        Pay securely online via Razorpay{settings.codEnabled ? ", or choose cash on delivery/pickup." : "."}
      </p>

      <div className="mt-8">
        <CheckoutForm
          currency={settings.currency}
          deliveryEnabled={settings.deliveryEnabled}
          pickupEnabled={settings.pickupEnabled}
          codEnabled={settings.codEnabled}
          defaults={{
            name: user?.name,
            email: user?.email,
            phone: user?.phone ?? undefined,
          }}
        />
      </div>
    </div>
  );
}
