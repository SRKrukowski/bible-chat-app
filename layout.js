/**
 * Root Layout Component
 * 
 * This component provides the root layout for the entire application,
 * including global providers and styles.
 */

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Bible Chat App',
  description: 'Daily Bible verse discussions with your housemates',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
