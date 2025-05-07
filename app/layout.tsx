import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quizito.App",
  description: "Um quiz interativo com vários temas do CPC",
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
          <div className="app-title">Quizito.App</div>
        </header>
        {children}
        <footer className="main-footer">
          <p>Desenvolvido pela <strong>🔬 UGITS</strong> (Unidade de Gestão da Inovação Tecnológica em Saúde) do HC-UFU/EBSERH</p>
          <p><strong>Endereço:</strong> <a href="https://maps.app.goo.gl/EYYmrS2ZRCSsbvLc7" target="_blank" rel="noopener noreferrer">R. República do Piratini, 1418 - Bloco 8F, Umuarama, Uberlândia - MG, 38402-028</a></p>
          <p><strong>Horário:</strong> Segunda a sexta-feira, 8h às 16h</p>
          <p><strong>Email:</strong> ugits.hc-ufu@ebserh.gov.br | <strong>WhatsApp:</strong> <a href="https://wa.me/553432182323" target="_blank" rel="noopener noreferrer">(34) 3218-2323</a></p>
          <p>© 2025 HC-UFU/EBSERH. Todos os direitos reservados.</p>
        </footer>
      </body>
    </html>
  );
}