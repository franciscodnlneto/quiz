import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiz do CEBS - 3º Aniversário | HC-UFU/HUBRASIL",
  description: "Participe do Quiz do 3º Aniversário do CEBS — Centro de Ensino Baseado em Simulação do HC-UFU/HUBRASIL. Teste seus conhecimentos sobre simulação clínica realística! 🎓",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* SEO e Social */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Participe do Quiz do 3º Aniversário do CEBS — Centro de Ensino Baseado em Simulação do HC-UFU/HUBRASIL. Teste seus conhecimentos sobre simulação clínica realística! 🎓" />

        {/* Open Graph (Facebook, LinkedIn, WhatsApp) */}
        <meta property="og:title" content="🎓 Quiz do CEBS - 3º Aniversário do Centro de Ensino Baseado em Simulação" />
        <meta property="og:description" content="Teste seus conhecimentos sobre simulação clínica realística! Quiz do 3º Aniversário do CEBS - HC-UFU/HUBRASIL." />
        <meta property="og:image" content="/dados_mocados/Quizito-FB-1200X630.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://quizito.app" />
        <meta property="og:type" content="website" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="🎓 Quiz do CEBS - 3º Aniversário" />
        <meta name="twitter:description" content="Teste seus conhecimentos sobre simulação clínica realística!" />
        <meta name="twitter:image" content="/dados_mocados/Quizito-TWITTER-1200X675.png" />

        {/* Pinterest (usa imagem vertical) */}
        <meta name="pinterest-rich-pin" content="true" />
        <meta property="og:image" content="/dados_mocados/Quizito-PINTEREST-1000X1500.png" />

        {/* Favicons e Web App */}
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
        <link rel="shortcut icon" href="/favicon_io/favicon.ico" />

        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
          integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />

        {/* Google Fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
        />
      </head>
      <body className={inter.className}>
        <header className="main-header">
          <div className="header-bg-decoration left"></div>
          <div className="header-bg-decoration right"></div>

          <div className="floating-dots">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className={`dot ${i % 2 === 0 ? 'primary' : 'secondary'}`}></div>
            ))}
          </div>

          <div className="header-container">
            <h1 className="app-title">
              <span className="title-decoration left">✦</span>
              Quizito.App
              <span className="title-decoration right">✦</span>
            </h1>
            <p className="app-subtitle">🎓 Quiz do 3º Aniversário do CEBS — HC-UFU/HUBRASIL</p>
          </div>
        </header>

        {children}

        <footer className="main-footer">
          {/* ===== Faixa superior — Contatos do CEBS ===== */}
          <section className="cebs-section">
            <div className="cebs-container">
              <h3 className="cebs-title">
                <span>🏥</span> CEBS <span className="accent">— Centro de Ensino Baseado em Simulação</span> <span>🎓</span>
              </h3>
              <p className="cebs-subtitle">
                Centro de simulação clínica realística do <strong>HC-UFU/HUBRASIL</strong>, dedicado ao treinamento e capacitação de profissionais e estudantes da área da saúde.
              </p>

              <div className="cebs-info-grid">
                <div className="cebs-info-item">
                  <p className="cebs-info-title">
                    <span>📍</span> Endereço
                  </p>
                  <p className="cebs-info-content">
                    Bloco 8F – Campus Umuarama<br />
                    R. República do Piratini, 1418<br />
                    Umuarama, Uberlândia – MG<br />
                    CEP 38405-266
                  </p>
                </div>

                <div className="cebs-info-item">
                  <p className="cebs-info-title">
                    <span>🕒</span> Horário de funcionamento
                  </p>
                  <p className="cebs-info-content">
                    Segunda a sexta-feira<br />
                    8h às 12h e 13h às 17h
                  </p>
                </div>

                <div className="cebs-info-item">
                  <p className="cebs-info-title">
                    <span>✉️</span> E-mail
                  </p>
                  <p className="cebs-info-content">
                    <a href="mailto:centrosimulac.hc-ufu@ebserh.gov.br">
                      centrosimulac.hc-ufu@ebserh.gov.br
                    </a>
                  </p>
                </div>

                <div className="cebs-info-item">
                  <p className="cebs-info-title">
                    <span>📞</span> WhatsApp / Ramal
                  </p>
                  <p className="cebs-info-content">
                    <a href="https://wa.me/553432182081" target="_blank" rel="noopener noreferrer">
                      (34) 3218-2081
                    </a>
                  </p>
                </div>
              </div>

              <a
                className="cebs-map-link"
                href="https://maps.app.goo.gl/6G5TVo7gRxpkK3Yg8"
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 Clique aqui para ver como chegar 🗺️
              </a>
            </div>
          </section>

          {/* ===== Faixa inferior — Créditos UGITS ===== */}
          <section className="ugits-section">
            <div className="ugits-container">
              <p className="ugits-tagline">
                Desenvolvido pela{' '}
                <span className="ugits-brand">🧪 UGITS</span>
                {' '}— Unidade de Gestão da Inovação Tecnológica em Saúde do HC-UFU/HUBRASIL
              </p>
              <p className="ugits-copyright">
                © 2026 HC-UFU/HUBRASIL. Todos os direitos reservados.{' '}
                <a className="ugits-link" href="mailto:ugits.hc-ufu@ebserh.gov.br">
                  ugits.hc-ufu@ebserh.gov.br
                </a>
              </p>
            </div>
          </section>
        </footer>
      </body>
    </html>
  );
}
