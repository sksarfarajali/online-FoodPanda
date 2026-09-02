import { getCurrentUser } from "@/lib/auth-guards";
import { getContactMessagesForUser } from "@/lib/services/contact.service";

export const metadata = { title: "My Messages" };

const STATUS_LABELS: Record<string, string> = {
  NEW: "Sent",
  READ: "Read by our team",
  RESOLVED: "Replied",
};

export default async function AccountMessagesPage() {
  const user = await getCurrentUser();
  const messages = user ? await getContactMessagesForUser(user.id) : [];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">My Messages</h1>
      <p className="mt-1 text-sm text-muted">
        Messages you&apos;ve sent us through the Contact page, and any reply from our team.
      </p>

      {messages.length === 0 ? (
        <p className="mt-6 text-sm text-muted">You haven&apos;t sent us a message yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {message.subject && (
                    <p className="text-sm font-medium text-foreground">{message.subject}</p>
                  )}
                  <p className="mt-1 text-sm text-muted">{message.message}</p>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {STATUS_LABELS[message.status] ?? message.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">{message.createdAt.toLocaleString()}</p>

              {message.adminReply && (
                <div className="mt-3 rounded-[var(--radius)] border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary">
                    Our reply{message.repliedAt ? ` · ${new Date(message.repliedAt).toLocaleString()}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-foreground">{message.adminReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
