'use client'

import { useState, useEffect } from 'react'

export default function HtmlEditor({ showNotification }) {
  const [htmlCode, setHtmlCode] = useState(
    '<!DOCTYPE html>\n<html lang="pt-br">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Minha Página</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      max-width: 800px;\n      margin: 0 auto;\n      padding: 20px;\n      color: #333;\n    }\n    h1 {\n      color: #1db954;\n    }\n  </style>\n</head>\n<body>\n  <h1>Olá Mundo!</h1>\n  <p>Este é um exemplo de código HTML editável. Faça alterações à esquerda para ver a prévia atualizada em tempo real.</p>\n</body>\n</html>'
  )
  const [previewUrl, setPreviewUrl] = useState('')
  // Removemos o estado activeTab pois agora exibimos o editor e a prévia lado a lado
  const [editorTheme, setEditorTheme] = useState('dark')
  const [fontSize, setFontSize] = useState(14)
  const [lineNumbers, setLineNumbers] = useState(true)

  // Atualiza a prévia quando o código HTML muda
  useEffect(() => {
    const blob = new Blob([htmlCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setPreviewUrl(url)
    
    // Limpar URL ao desmontar
    return () => URL.revokeObjectURL(url)
  }, [htmlCode])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode).then(() => {
      showNotification('Código copiado para a área de transferência!')
    }, (err) => {
      console.error('Erro ao copiar código:', err)
      showNotification('Erro ao copiar código', 'error')
    })
  }

  const handleDownload = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'index.html'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Arquivo HTML baixado com sucesso!')
  }

  // Templates prontos para uso rápido
  const templates = [
    { 
      name: 'Simples',
      code: '<!DOCTYPE html>\n<html lang="pt-br">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Minha Página</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      max-width: 800px;\n      margin: 0 auto;\n      padding: 20px;\n      color: #333;\n    }\n    h1 {\n      color: #1db954;\n    }\n  </style>\n</head>\n<body>\n  <h1>Olá Mundo!</h1>\n  <p>Este é um exemplo de código HTML editável. Faça alterações à esquerda para ver a prévia atualizada em tempo real.</p>\n</body>\n</html>'
    },
    {
      name: 'Landing Page',
      code: '<!DOCTYPE html>\n<html lang="pt-br">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Landing Page</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      margin: 0;\n      padding: 0;\n    }\n    body {\n      font-family: Arial, sans-serif;\n      line-height: 1.6;\n      color: #333;\n    }\n    header {\n      background: #1db954;\n      color: white;\n      padding: 20px;\n      text-align: center;\n    }\n    .hero {\n      padding: 60px 20px;\n      text-align: center;\n      background: #f4f4f4;\n    }\n    .hero h1 {\n      font-size: 2.5rem;\n      margin-bottom: 20px;\n    }\n    .hero p {\n      font-size: 1.2rem;\n      max-width: 600px;\n      margin: 0 auto 30px;\n    }\n    .btn {\n      display: inline-block;\n      background: #1db954;\n      color: white;\n      padding: 10px 30px;\n      border-radius: 5px;\n      text-decoration: none;\n      font-weight: bold;\n    }\n    .features {\n      padding: 40px 20px;\n      text-align: center;\n    }\n    .feature {\n      margin: 20px;\n    }\n    footer {\n      background: #333;\n      color: white;\n      text-align: center;\n      padding: 20px;\n    }\n  </style>\n</head>\n<body>\n  <header>\n    <h1>Minha Empresa</h1>\n  </header>\n  \n  <section class="hero">\n    <h1>Bem-vindo à Nossa Landing Page</h1>\n    <p>Uma solução completa para suas necessidades digitais. Crie, edite e gerencie seu conteúdo com facilidade.</p>\n    <a href="#" class="btn">Comece Agora</a>\n  </section>\n  \n  <section class="features">\n    <h2>Nossos Recursos</h2>\n    <div class="feature">\n      <h3>Fácil de Usar</h3>\n      <p>Interface intuitiva para qualquer nível de usuário.</p>\n    </div>\n    <div class="feature">\n      <h3>Totalmente Responsivo</h3>\n      <p>Funciona em qualquer dispositivo, de desktop a mobile.</p>\n    </div>\n    <div class="feature">\n      <h3>Suporte Rápido</h3>\n      <p>Nossa equipe está sempre pronta para ajudar.</p>\n    </div>\n  </section>\n  \n  <footer>\n    <p>&copy; 2025 Minha Empresa. Todos os direitos reservados.</p>\n  </footer>\n</body>\n</html>'
    },
    {
      name: 'Formulário',
      code: '<!DOCTYPE html>\n<html lang="pt-br">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Formulário de Contato</title>\n  <style>\n    body {\n      font-family: Arial, sans-serif;\n      max-width: 500px;\n      margin: 0 auto;\n      padding: 20px;\n      background-color: #f5f5f5;\n    }\n    .form-container {\n      background: white;\n      padding: 30px;\n      border-radius: 8px;\n      box-shadow: 0 2px 10px rgba(0,0,0,0.1);\n    }\n    h1 {\n      color: #1db954;\n      text-align: center;\n    }\n    .form-group {\n      margin-bottom: 20px;\n    }\n    label {\n      display: block;\n      margin-bottom: 5px;\n      font-weight: bold;\n    }\n    input, textarea, select {\n      width: 100%;\n      padding: 10px;\n      border: 1px solid #ddd;\n      border-radius: 4px;\n      font-size: 16px;\n    }\n    textarea {\n      height: 100px;\n    }\n    button {\n      background-color: #1db954;\n      color: white;\n      border: none;\n      padding: 12px 20px;\n      border-radius: 4px;\n      cursor: pointer;\n      font-size: 16px;\n      width: 100%;\n    }\n    button:hover {\n      background-color: #18a64b;\n    }\n  </style>\n</head>\n<body>\n  <div class="form-container">\n    <h1>Entre em Contato</h1>\n    <form>\n      <div class="form-group">\n        <label for="name">Nome</label>\n        <input type="text" id="name" name="name" required>\n      </div>\n      \n      <div class="form-group">\n        <label for="email">Email</label>\n        <input type="email" id="email" name="email" required>\n      </div>\n      \n      <div class="form-group">\n        <label for="subject">Assunto</label>\n        <select id="subject" name="subject">\n          <option value="informacao">Informações</option>\n          <option value="suporte">Suporte</option>\n          <option value="comercial">Comercial</option>\n          <option value="outro">Outro</option>\n        </select>\n      </div>\n      \n      <div class="form-group">\n        <label for="message">Mensagem</label>\n        <textarea id="message" name="message" required></textarea>\n      </div>\n      \n      <button type="submit">Enviar Mensagem</button>\n    </form>\n  </div>\n</body>\n</html>'
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          <span className="text-primary">&gt;</span> Editor HTML em Tempo Real
        </h2>
        
        <button 
          onClick={() => window.history.back()}
          className="btn btn-sm btn-secondary flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>
      </div>
      
      <p className="text-gray-300 mb-6 max-w-3xl">
        Edite código HTML e veja o resultado em tempo real. Ideal para prototipagem rápida, testes de layout
        ou aprendizado de HTML e CSS.
      </p>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <span className="text-sm text-gray-400">Carregar template:</span>
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => setHtmlCode(template.code)}
            className="btn btn-sm btn-secondary"
          >
            {template.name}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Editor de Código (Lado Esquerdo) */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex items-center gap-2 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>index.html</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleCopyCode}
                className="p-1.5 text-gray-400 hover:text-primary"
                title="Copiar código"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              
              <button 
                onClick={() => setEditorTheme(editorTheme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 text-gray-400 hover:text-primary"
                title={editorTheme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              >
                {editorTheme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <textarea
            value={htmlCode}
            onChange={(e) => setHtmlCode(e.target.value)}
            className={`w-full h-[500px] p-4 font-mono text-sm focus:outline-none resize-none ${editorTheme === 'dark' ? 'bg-[#0d1117] text-gray-300' : 'bg-white text-gray-800'}`}
            spellCheck="false"
            style={{ fontSize: `${fontSize}px` }}
            placeholder="Digite seu código HTML aqui..."
          />
        </div>
        
        {/* Preview (Lado Direito) */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex items-center gap-2 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview</span>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleDownload}
                className="p-1.5 text-gray-400 hover:text-primary"
                title="Baixar HTML"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
              <a 
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-gray-400 hover:text-primary"
                title="Abrir em nova janela"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="h-[500px] w-full bg-white overflow-auto">
            {htmlCode ? (
              <iframe
                src={previewUrl}
                title="Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className="text-xl font-bold mb-2">Editor HTML em Tempo Real</h3>
                <p className="text-sm max-w-xs">
                  Digite seu código HTML ao lado para ver a prévia instantânea aqui
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <label className="text-sm text-gray-400 mr-2">Tamanho da Fonte:</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-[#21262d] border border-border rounded px-2 py-1"
            >
              {[12, 14, 16, 18, 20].map(size => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="text-sm text-gray-400 mr-2">Números de Linha:</label>
            <input
              type="checkbox"
              checked={lineNumbers}
              onChange={(e) => setLineNumbers(e.target.checked)}
              className="form-checkbox h-4 w-4"
            />
          </div>
        </div>
        
        <button
          onClick={() => setHtmlCode('')}
          className="btn btn-sm btn-secondary"
        >
          Limpar Código
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-bold mt-2">Edição em Tempo Real</h4>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Veja as alterações instantaneamente enquanto você escreve o código.
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h4 className="font-bold mt-2">Templates Prontos</h4>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Comece rapidamente com templates pré-configurados para diversos usos.
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h4 className="font-bold mt-2">Exportação Fácil</h4>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Exporte seu código HTML com um clique para usar em qualquer lugar.
          </p>
        </div>
      </div>
    </div>
  )
}
