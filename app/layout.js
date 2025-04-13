export const metadata = {
  title: 'Organizador de Banco de Dados CSV',
  description: 'Sistema de importação e manipulação de dados CSV e Excel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  )
}
