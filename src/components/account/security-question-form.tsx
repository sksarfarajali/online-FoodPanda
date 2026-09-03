"use client";

import { useState, useTransition } from "react";
import { SECURITY_QUESTIONS } from "@/lib/validations/auth.schema";
import { setSecurityQuestion } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function SecurityQuestionForm({ currentQuestion }: { currentQuestion: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [securityQuestion, setSecurityQuestionValue] = useState<string>(
    currentQuestion ?? SECURITY_QUESTIONS[0]
  );
  const [securityAnswer, setSecurityAnswer] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await setSecurityQuestion({ securityQuestion, securityAnswer });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setSecurityAnswer("");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-muted">
        Used to reset your password if you forget it — we don&apos;t send emails, so this is how
        we verify it&apos;s you.
        {currentQuestion && " You already have one set; saving here replaces it."}
      </p>
      <div>
        <Label htmlFor="securityQuestion">Question</Label>
        <select
          id="securityQuestion"
          value={securityQuestion}
          onChange={(e) => setSecurityQuestionValue(e.target.value)}
          className="h-11 w-full rounded-[var(--radius)] border border-border bg-surface px-3.5 text-sm text-foreground"
        >
          {SECURITY_QUESTIONS.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="securityAnswer">Answer</Label>
        <Input
          id="securityAnswer"
          value={securityAnswer}
          onChange={(e) => setSecurityAnswer(e.target.value)}
          required
        />
      </div>
      {error && <FieldError>{error}</FieldError>}
      {success && <p className="text-sm text-success">Security question saved.</p>}
      <Button type="submit" size="sm" isLoading={isPending}>
        {currentQuestion ? "Update" : "Save"}
      </Button>
    </form>
  );
}
