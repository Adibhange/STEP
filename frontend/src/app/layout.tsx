import './globals.css';
import { AppProvider } from '@/providers/AppProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';

export const metadata = {
  title: 'STEP — Sthapatya Talent Excellence Platform | SCIPL',
  description: 'Official enterprise talent operations and assessment platform for Sthapatya Consultants (I) Pvt. Ltd. (SCIPL).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AppProvider>
          <NotificationProvider />
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
