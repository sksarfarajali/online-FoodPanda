import { getCurrentUser } from "@/lib/auth-guards";
import { getReservationsForUser } from "@/lib/services/reservation.service";

export const metadata = { title: "My Reservations" };

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending confirmation",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
};

export default async function AccountReservationsPage() {
  const user = await getCurrentUser();
  const reservations = user ? await getReservationsForUser(user.id) : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">My Reservations</h1>

      {reservations.length === 0 ? (
        <p className="mt-6 text-sm text-muted">You haven&apos;t made any reservations yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {reservation.reservationDate.toLocaleDateString()} at {reservation.reservationTime}
                </p>
                <span className="text-xs text-muted">
                  {STATUS_LABELS[reservation.status] ?? reservation.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {reservation.partySize} guest{reservation.partySize === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
