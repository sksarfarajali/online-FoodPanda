import { LegalPage } from "@/components/shared/legal-page";

export const metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <section>
        <h2>Use of This Website</h2>
        <p>
          This website is provided to help you browse our menu, make reservations, place orders,
          and contact us. By using it, you agree to provide accurate information when submitting
          forms.
        </p>
      </section>
      <section>
        <h2>Orders & Reservations</h2>
        <p>
          Orders and reservations are subject to confirmation and availability. We reserve the
          right to decline or cancel a request, in which case we will attempt to notify you using
          the contact details provided.
        </p>
      </section>
      <section>
        <h2>Pricing</h2>
        <p>
          Menu prices are subject to change without prior notice. The price charged is the price
          shown at the time an order is confirmed.
        </p>
      </section>
      <section>
        <h2>Limitation of Liability</h2>
        <p>
          We aim to keep information on this site accurate and up to date, but we do not guarantee
          it is free of errors or omissions.
        </p>
      </section>
    </LegalPage>
  );
}
