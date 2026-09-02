import { prisma } from "@/lib/prisma";
import { MessageRow } from "@/components/admin/messages/message-row";

export const metadata = { title: "Messages" };

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true } } },
  });

  // A guest submission (no userId) still shows up for the customer if their email matches
  // an existing account — check which orphaned messages have one, so the badge is accurate.
  const orphanEmails = [...new Set(messages.filter((m) => !m.userId).map((m) => m.email))];
  const matchingAccounts = orphanEmails.length
    ? await prisma.user.findMany({
        where: { OR: orphanEmails.map((email) => ({ email: { equals: email, mode: "insensitive" as const } })) },
        select: { email: true },
      })
    : [];
  const matchedEmails = new Set(matchingAccounts.map((u) => u.email.toLowerCase()));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-foreground">Messages</h1>

      <div className="mt-6 space-y-3">
        {messages.map((message) => (
          <MessageRow
            key={message.id}
            id={message.id}
            status={message.status}
            adminReply={message.adminReply}
            repliedAt={message.repliedAt}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {message.name}{" "}
                  {message.status === "NEW" && (
                    <span className="ml-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary">
                      New
                    </span>
                  )}
                  {!message.user && matchedEmails.has(message.email.toLowerCase()) && (
                    <span
                      className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                      title="Sent while logged out, but this email matches an existing account — your reply will show once they sign in."
                    >
                      Guest — matches an account
                    </span>
                  )}
                  {!message.user && !matchedEmails.has(message.email.toLowerCase()) && (
                    <span
                      className="ml-1 rounded-full bg-muted/20 px-2 py-0.5 text-xs text-muted"
                      title="Submitted while logged out, and no account uses this email — a reply won't be visible anywhere in-app. You'll need to contact them directly."
                    >
                      Guest — no account to reply into
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
