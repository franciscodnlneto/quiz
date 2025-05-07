import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiz Interativo",
  description: "Um quiz interativo com vários temas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Adicione aqui outros elementos de head, se necessário */}
      </head>
      <body className={inter.className}>
        <header className="main-header">
          <h1>Quiz Interativo</h1>
        </header>
        {children}
        <footer className="main-footer">
          <p>© 2025 Quiz Interativo - Todos os direitos reservados</p>
        </footer>
      </body>
    </html>
  );
}