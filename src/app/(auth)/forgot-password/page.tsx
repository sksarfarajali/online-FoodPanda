import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-foreground">Forgot password</h1>
      <p className="mt-2 text-sm text-muted">
        Answer your security question to set a new password.
      </p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
