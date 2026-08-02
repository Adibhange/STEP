import './globals.css';
import { AppProvider } from '@/providers/AppProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';

export const metadata = {
  title: 'STEP - Sthapatya Talent Excellence Platform',
  description: 'Precision-built enterprise talent operations platform for Sthapatya.',
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
