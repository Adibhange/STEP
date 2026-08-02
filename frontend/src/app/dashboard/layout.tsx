import { DashboardShell } from '@/features/dashboard/shell/DashboardShell';

/**
 * STEP Enterprise Dashboard Layout
 *
 * Injects DashboardShell (Sidebar + Header) around all dashboard child pages.
 * Future pages only need to create their content — the shell is automatic.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
