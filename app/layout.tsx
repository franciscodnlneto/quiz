import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quizito.App",
  description: "Uma ferramenta totalmente FREE para gerar Quiz Interativo!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Font Awesome para ícones */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" 
          integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        {/* Google Fonts - Poppins para o título */}
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
        />
      </head>
      <body className={inter.className}>
        <header className="main-header">
          {/* Background decorations */}
          <div className="header-bg-decoration left"></div>
          <div className="header-bg-decoration right"></div>
          
          {/* Floating dots animation */}
          <div className="floating-dots">
            <div className="dot primary"></div>
            <div className="dot secondary"></div>
            <div className="dot primary"></div>
            <div className="dot secondary"></div>
            <div className="dot primary"></div>
            <div className="dot secondary"></div>
            <div className="dot primary"></div>
          </div>
          
          <div className="header-container">
            <h1 className="app-title">
              <span className="title-decoration left">✦</span>
              Quizito.App
              <span className="title-decoration right">✦</span>
            </h1>
            <p className="app-subtitle">Uma ferramenta totalmente FREE para gerar Quiz Interativo!</p>
          </div>
        </header>
        
        {children}
        
        <footer className="main-footer">
          <div className="footer-container">
            <h3 className="footer-title">
              Quizito.App
              <span className="footer-subtitle">Uma ferramenta totalmente FREE para gerar Quiz Interativo!</span>
            </h3>
            
            <p className="footer-tagline">
              Desenvolvido pela 
              <strong style={{color: 'var(--primary-color)', margin: '0 5px'}}>🔬 UGITS</strong>
              (Unidade de Gestão da Inovação Tecnológica em Saúde) do HC-UFU/EBSERH
            </p>
            
            <hr className="footer-divider" />
            
            <div className="footer-info-container">
              <div className="footer-info-item">
                <p className="footer-info-title">
                  <i className="fas fa-map-marker-alt footer-icon map"></i>
                  <strong>Endereço:</strong>
                </p>
                <a 
                  href="https://maps.app.goo.gl/EYYmrS2ZRCSsbvLc7" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  R. República do Piratini, 1418 - Bloco 8F
                </a>
                <p className="footer-info-subtitle">Umuarama, Uberlândia - MG, 38402-028</p>
              </div>
              
              <div className="footer-info-item">
                <p className="footer-info-title">
                  <i className="fas fa-clock footer-icon clock"></i>
                  <strong>Horário:</strong>
                </p>
                <p>Segunda a sexta-feira, 8h às 16h</p>
              </div>
              
              <div className="footer-info-item">
                <p className="footer-info-title">
                  <i className="fas fa-envelope footer-icon email"></i>
                  <strong>Email:</strong>
                </p>
                <a 
                  href="mailto:ugits.hc-ufu@ebserh.gov.br" 
                  className="footer-link"
                >
                  ugits.hc-ufu@ebserh.gov.br
                </a>
              </div>
              
              <div className="footer-info-item">
                <p className="footer-info-title">
                  <i className="fas fa-phone footer-icon phone"></i>
                  <strong>WhatsApp:</strong>
                </p>
                <a 
                  href="https://wa.me/553432182323" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  (34) 3218-2323
                </a>
              </div>
            </div>
            
            <hr className="footer-divider" />
            
            <p className="footer-copyright">
              © 2025 HC-UFU/EBSERH. Todos os direitos reservados.
              <br />
              Desenvolvido pela 
              <a 
                href="mailto:ugits.hc-ufu@ebserh.gov.br" 
                className="footer-link"
                style={{margin: '0 5px'}}
              >
                Unidade de Gestão da Inovação Tecnológica em Saúde
              </a>
              - UGITS HC-UFU/EBSERH
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}