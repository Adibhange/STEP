import './globals.css';
import { ReduxProvider } from '@/providers/redux-provider';
import { UserPreferencesProvider } from '@/providers/user-preferences-provider';

export const metadata = {
  title: 'STEP ERMS - Enterprise Recruitment Management System',
  description: 'Commercial-Grade Enterprise Recruitment, Assessment & Candidate Verification System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReduxProvider>
          <UserPreferencesProvider>{children}</UserPreferencesProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
