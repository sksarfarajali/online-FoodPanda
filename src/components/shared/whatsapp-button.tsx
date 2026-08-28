import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function toWhatsAppDigits(raw: string) {
  return raw.replace(/[^0-9]/g, "");
}

export function WhatsAppLink({
  phone,
  message,
  className,
  children,
}: {
  phone: string;
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const digits = toWhatsAppDigits(phone);
  const href = `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-colors duration-150",
        className
      )}
    >
      {children}
    </a>
  );
}

/** Fixed floating WhatsApp CTA, shown site-wide when a number is configured. */
export function WhatsAppFloatingButton({ phone }: { phone: string }) {
  return (
    <WhatsAppLink
      phone={phone}
      message="Hi! I'd like to know more about Swaad-e-Mehfil."
      className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-success text-white shadow-lg hover:opacity-90"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
      <span className="sr-only">Chat on WhatsApp</span>
    </WhatsAppLink>
  );
}
