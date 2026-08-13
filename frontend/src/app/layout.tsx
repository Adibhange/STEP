import './globals.css';
import { AppProvider } from '@/providers/AppProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';

export const metadata = {
  title: 'STEP — Sthapatya Talent Excellence Platform | SCIPL',
  description: 'Official enterprise talent operations and assessment platform for Sthapatya Consultants (I) Pvt. Ltd. (SCIPL).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" data-theme="dark" suppressHydrationWarning>
      <body className="bg-[var(--canvas)] text-[var(--text-primary)] min-h-screen antialiased" suppressHydrationWarning>
        <AppProvider>
          <NotificationProvider />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
