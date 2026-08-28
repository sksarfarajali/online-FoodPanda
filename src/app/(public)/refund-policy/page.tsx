import { LegalPage } from "@/components/shared/legal-page";

export const metadata = { title: "Refund & Cancellation Policy" };

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <section>
        <h2>Order Cancellations</h2>
        <p>
          If you need to cancel an order, please contact us as soon as possible. Orders already
          being prepared or out for delivery may not be eligible for cancellation.
        </p>
      </section>
      <section>
        <h2>Refunds</h2>
        <p>
          Refunds for a successfully cancelled or undelivered order are issued to the original
          payment method. Processing times depend on your bank or payment provider.
        </p>
      </section>
      <section>
        <h2>Quality Issues</h2>
        <p>
          If there is a problem with your order, please contact us within a reasonable time so we
          can make it right.
        </p>
      </section>
      <section>
        <h2>Reservation Cancellations</h2>
        <p>
          Reservations can be cancelled or changed by contacting us directly. No payment is
          collected at the time of booking a table.
        </p>
      </section>
    </LegalPage>
  );
}
