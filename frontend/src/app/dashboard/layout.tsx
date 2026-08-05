import { DashboardShell } from '@/features/dashboard/shell/DashboardShell';
import { AuthGuard } from '@/providers/AuthGuard';

/**
 * STEP Enterprise Dashboard Layout
 *
 * Enforces route protection via AuthGuard & injects DashboardShell (Sidebar + Header).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
