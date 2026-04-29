import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Story Agent V1',
  description: 'Base V1 com Next.js + FastAPI + PostgreSQL + Redis'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
