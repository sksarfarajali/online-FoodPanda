"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateContactMessageStatus, replyToContactMessage } from "@/lib/actions/contact.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function MessageRow({
  id,
  status,
  adminReply,
  repliedAt,
  children,
}: {
  id: string;
  status: "NEW" | "READ" | "RESOLVED";
  adminReply: string | null;
  repliedAt: Date | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isSending, startSending] = useTransition();

  function handleSend() {
    setReplyError(null);
    startSending(async () => {
      const result = await replyToContactMessage({ id, reply: replyText });
      if (!result.success) {
        setReplyError(result.error);
        return;
      }
      setReplying(false);
      setReplyText("");
      setCurrent("RESOLVED");
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      {children}

      {adminReply && (
        <div className="mt-3 rounded-[var(--radius)] border border-border bg-background p-3">
          <p className="text-xs font-medium text-muted">
            You replied{repliedAt ? ` on ${new Date(repliedAt).toLocaleString()}` : ""}
          </p>
          <p className="mt-1 text-sm text-foreground">{adminReply}</p>
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <select
          value={current}
          disabled={isPending}
          onChange={(e) => {
            const next = e.target.value as typeof current;
            setCurrent(next);
            startTransition(async () => {
              await updateContactMessageStatus(id, next);
              router.refresh();
            });
          }}
          className="h-8 rounded-[var(--radius)] border border-border bg-background px-2 text-xs text-foreground"
        >
          <option value="NEW">New</option>
          <option value="READ">Read</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <button
          type="button"
          onClick={() => setReplying((v) => !v)}
          className="text-xs font-medium text-primary hover:underline"
        >
          {adminReply ? "Send another reply" : "Reply"}
        </button>
      </div>

      {replying && (
        <div className="mt-3 space-y-2">
          <Textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your reply — the customer will see it in their account (only if they were signed in when they wrote in)."
            maxLength={2000}
          />
          {replyError && (
            <p role="alert" className="text-sm text-danger">
              {replyError}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" size="sm" isLoading={isSending} disabled={!replyText.trim()} onClick={handleSend}>
              Send Reply
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setReplying(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
