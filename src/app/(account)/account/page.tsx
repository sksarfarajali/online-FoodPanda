import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-guards";
import { PushNotificationToggle } from "@/components/shared/push-notification-toggle";

export const metadata = { title: "My Account" };

export default async function AccountProfilePage() {
  const sessionUser = await getCurrentUser();
  const user = sessionUser
    ? await prisma.user.findUnique({ where: { id: sessionUser.id } })
    : null;

  if (!user) return null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">My Profile</h1>
      <div className="mt-6 space-y-4 rounded-lg border border-border bg-surface p-5">
        <div>
          <p className="text-xs text-muted">Name</p>
          <p className="text-sm text-foreground">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Email</p>
          <p className="text-sm text-foreground">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Phone</p>
          <p className="text-sm text-foreground">{user.phone ?? "Not provided"}</p>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-surface p-5">
        <p className="text-sm font-medium text-foreground">Notifications</p>
        <p className="mt-1 text-xs text-muted">
          Get notified when your order status changes, even if you don&apos;t have the app open.
        </p>
        <div className="mt-3">
          <PushNotificationToggle label="Order updates" />
        </div>
      </div>
    </div>
  );
}
