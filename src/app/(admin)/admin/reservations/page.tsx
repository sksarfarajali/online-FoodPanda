import { getAllReservations } from "@/lib/services/reservation.service";
import { ReservationRowActions } from "@/components/admin/reservations/reservation-row-actions";

export const metadata = { title: "Reservations" };

export default async function AdminReservationsPage() {
  const reservations = await getAllReservations();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Reservations</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-background text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {reservations.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-foreground">
                  {r.reservationDate.toLocaleDateString()} {r.reservationTime}
                </td>
                <td className="px-4 py-3 text-foreground">{r.name}</td>
                <td className="px-4 py-3 text-muted">
                  {r.phone}
                  <br />
                  {r.email}
                </td>
                <td className="px-4 py-3 text-muted">{r.partySize}</td>
                <td className="px-4 py-3">
                  <ReservationRowActions id={r.id} currentStatus={r.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted">{r.specialRequest}</td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  No reservations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
