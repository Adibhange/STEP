import './globals.css';
import { StoreProvider } from '@/store/provider';

export const metadata = {
  title: 'ERMS - Enterprise Recruitment Management System',
  description: 'Production-Ready Enterprise Recruitment, Assessment & Interview Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
