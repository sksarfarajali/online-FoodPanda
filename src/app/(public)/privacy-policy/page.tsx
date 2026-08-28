import { LegalPage } from "@/components/shared/legal-page";
import { getSettings } from "@/lib/services/settings.service";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPolicyPage() {
  const settings = await getSettings();

  return (
    <LegalPage title="Privacy Policy">
      <section>
        <h2>Information We Collect</h2>
        <p>
          When you make a reservation, place an order, or contact us through this website, we
          collect the information you provide directly, such as your name, phone number, email
          address, and delivery address where applicable.
        </p>
      </section>
      <section>
        <h2>How We Use Your Information</h2>
        <p>
          We use this information to process reservations and orders, respond to inquiries, and
          communicate with you about your request. We do not sell your personal information.
        </p>
      </section>
      <section>
        <h2>Data Retention</h2>
        <p>
          We retain order, reservation, and message records as needed to operate the restaurant
          and meet applicable legal obligations.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to{" "}
          {settings.email ? <a href={`mailto:${settings.email}`}>{settings.email}</a> : "us"}.
        </p>
      </section>
    </LegalPage>
  );
}
