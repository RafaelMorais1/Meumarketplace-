import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Marketplace MVP',
  description: 'Marketplace modular com autenticação segura e controle por papéis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

