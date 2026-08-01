import './globals.css';
import { ReduxProvider } from '@/providers/redux-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { AccessibilityProvider } from '@/providers/accessibility-provider';
import { UserPreferencesProvider } from '@/providers/user-preferences-provider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';

export const metadata = {
  title: 'STEP - Sthapatya Talent Excellence Platform',
  description: 'Precision-built enterprise talent operations platform for Sthapatya.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <ThemeProvider>
            <NotificationProvider />
            <AccessibilityProvider>
              <UserPreferencesProvider>{children}</UserPreferencesProvider>
            </AccessibilityProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
