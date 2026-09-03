"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { getSecurityQuestion, resetPasswordWithSecurityAnswer } from "@/lib/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotFound(false);
    startTransition(async () => {
      const result = await getSecurityQuestion(email);
      if (!result.question) {
        setNotFound(true);
        return;
      }
      setQuestion(result.question);
    });
  }

  function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    startTransition(async () => {
      const result = await resetPasswordWithSecurityAnswer({ email, securityAnswer: answer, newPassword });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    });
  }

  if (success) {
    return (
      <div>
        <p className="text-sm text-foreground">
          Your password has been reset. You can now log in with your new password.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Go to login
        </Link>
      </div>
    );
  }

  if (!question) {
    return (
      <form onSubmit={handleLookup} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        {notFound && (
          <p role="alert" className="text-sm text-danger">
            We couldn&apos;t find a security question for that account.{" "}
            <Link href="/contact" className="underline">
              Contact us
            </Link>{" "}
            for help.
          </p>
        )}
        <Button type="submit" isLoading={isPending} className="w-full">
          Continue
        </Button>
        <p className="text-center text-sm text-muted">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <div>
        <Label>Security question</Label>
        <p className="text-sm text-foreground">{question}</p>
      </div>
      <div>
        <Label htmlFor="answer">Your answer</Label>
        <Input id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />
      </div>
      {error && <FieldError>{error}</FieldError>}
      <Button type="submit" isLoading={isPending} className="w-full">
        Reset password
      </Button>
    </form>
  );
}
