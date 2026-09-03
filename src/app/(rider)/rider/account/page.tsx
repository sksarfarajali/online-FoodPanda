import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-guards";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { SecurityQuestionForm } from "@/components/account/security-question-form";

export const metadata = { title: "My Account" };

export default async function RiderAccountPage() {
  const sessionUser = await getCurrentUser();
  const user = await prisma.user.findUnique({ where: { id: sessionUser!.id } });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-foreground">My Account</h1>
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-xs text-muted">Name</p>
        <p className="text-sm text-foreground">{user.name}</p>
        <p className="mt-2 text-xs text-muted">Email</p>
        <p className="text-sm text-foreground">{user.email}</p>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">Change Password</p>
        <div className="mt-3">
          <ChangePasswordForm />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-sm font-medium text-foreground">Security Question</p>
        <div className="mt-3">
          <SecurityQuestionForm currentQuestion={user.securityQuestion} />
        </div>
      </div>
    </div>
  );
}
