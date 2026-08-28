import { prisma } from "@/lib/prisma";
import { MessageRow } from "@/components/admin/messages/message-row";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Messages</h1>

      <div className="mt-6 space-y-3">
        {messages.map((message) => (
          <MessageRow key={message.id} id={message.id} status={message.status}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {message.name}{" "}
                  {message.status === "NEW" && (
                    <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                      New
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {message.email} {message.phone && `· ${message.phone}`}
                </p>
                {message.subject && (
                  <p className="mt-1 text-sm font-medium text-foreground">{message.subject}</p>
                )}
                <p className="mt-1 text-sm text-muted">{message.message}</p>
              </div>
              <p className="shrink-0 text-xs text-muted">{message.createdAt.toLocaleString()}</p>
            </div>
          </MessageRow>
        ))}
        {messages.length === 0 && <p className="text-sm text-muted">No messages yet.</p>}
      </div>
    </div>
  );
}
