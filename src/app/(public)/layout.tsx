import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { WhatsAppFloatingButton } from "@/components/shared/whatsapp-button";
import { getSettings } from "@/lib/services/settings.service";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {settings.whatsappNumber && <WhatsAppFloatingButton phone={settings.whatsappNumber} />}
    </>
  );
}
