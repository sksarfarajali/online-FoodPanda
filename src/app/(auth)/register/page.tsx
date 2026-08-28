import { RegisterForm } from "./register-form";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-foreground">Create your account</h1>
      <p className="mt-2 text-sm text-muted">Track orders and reservations in one place.</p>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </div>
  );
}
