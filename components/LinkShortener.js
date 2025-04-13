'use client'

import { useState } from 'react'

export default function LinkShortener({ showNotification }) {
  const [url, setUrl] = useState('')
  const [customAlias, setCustomAlias] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shortenedUrl, setShortenedUrl] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!url) {
      setError('Por favor, insira uma URL válida.')
      return
    }
    
    // Validar URL
    try {
      new URL(url)
    } catch (err) {
      setError('URL inválida. Certifique-se de incluir http:// ou https://')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simular resposta de API de encurtamento (em produção, substituir por API real)
      // Simulação para fins de demonstração
      setTimeout(() => {
        // Gerar um alias aleatório se não houver personalizado
        const alias = customAlias || generateRandomAlias()
        const shortUrl = `https://devtech.link/${alias}`
        
        setShortenedUrl({
          original: url,
          short: shortUrl,
          clicks: 0,
          created: new Date().toISOString()
        })
        
        showNotification('Link encurtado com sucesso!')
        setIsLoading(false)
      }, 1200)
    } catch (err) {
      console.error('Erro ao encurtar link:', err)
      setError('Ocorreu um erro ao encurtar o link. Tente novamente.')
      setIsLoading(false)
    }
  }

  const generateRandomAlias = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const copyToClipboard = () => {
    if (shortenedUrl) {
      navigator.clipboard.writeText(shortenedUrl.short)
      showNotification('Link copiado para a área de transferência!')
    }
  }

  const resetForm = () => {
    setUrl('')
    setCustomAlias('')
    setShortenedUrl(null)
    setError(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          <span className="text-primary">&gt;</span> Encurtador de Links
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
      
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-center mb-6">
            Crie links curtos e compartilhe com facilidade. Links encurtados são mais fáceis de lembrar e compartilhar!
          </p>
          
          {!shortenedUrl ? (
            <form onSubmit={handleSubmit} className="bg-card p-6 rounded-lg border border-border mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">URL Original</label>
                <div className="input-group">
                  <div className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://exemplo.com/minha-pagina-com-url-muito-longa"
                    className="input-field"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Personalizar Link (opcional)
                </label>
                <div className="flex items-center">
                  <span className="bg-[#21262d] text-gray-400 px-3 py-2 rounded-l-md border border-r-0 border-border">
                    devtech.link/
                  </span>
                  <input
                    type="text"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    placeholder="meu-link"
                    className="flex-grow bg-input border border-border text-white px-3 py-2 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Deixe em branco para gerar automaticamente
                </p>
              </div>
              
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Encurtando...
                  </>
                ) : (
                  'Encurtar Link'
                )}
              </button>
            </form>
          ) : (
            <div className="bg-card p-6 rounded-lg border-2 border-primary mb-6 animate-fade-in">
              <h3 className="text-xl font-bold mb-4 text-center text-primary">Link Encurtado com Sucesso!</h3>
              
              <div className="mb-6">
                <div className="bg-[#21262d] p-3 rounded-md mb-4">
                  <span className="text-gray-400 text-sm block mb-1">URL Original:</span>
                  <p className="text-sm truncate">{shortenedUrl.original}</p>
                </div>
                
                <div className="bg-[#21262d] p-3 rounded-md border-2 border-primary">
                  <span className="text-gray-400 text-sm block mb-1">URL Encurtada:</span>
                  <div className="flex items-center">
                    <p className="font-mono text-lg text-primary flex-grow truncate">{shortenedUrl.short}</p>
                    <button 
                      onClick={copyToClipboard}
                      className="ml-2 p-2 bg-primary/20 hover:bg-primary/30 rounded-md transition-colors"
                      title="Copiar para área de transferência"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                <div className="bg-[#21262d] p-3 rounded-md">
                  <span className="text-gray-400 text-sm block">Cliques:</span>
                  <p className="text-xl font-bold">0</p>
                </div>
                <div className="bg-[#21262d] p-3 rounded-md">
                  <span className="text-gray-400 text-sm block">Criado em:</span>
                  <p className="text-sm">{new Date(shortenedUrl.created).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Encurtar Outro Link
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-4 rounded-lg border border-border text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Rápido e Simples</h3>
            <p className="text-sm text-gray-400">Transforme links longos em URLs curtas e amigáveis com apenas um clique.</p>
          </div>
          
          <div className="bg-card p-4 rounded-lg border border-border text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Seguro e Confiável</h3>
            <p className="text-sm text-gray-400">Seus links são protegidos e estarão sempre disponíveis quando você precisar deles.</p>
          </div>
          
          <div className="bg-card p-4 rounded-lg border border-border text-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-bold mb-2">Estatísticas Detalhadas</h3>
            <p className="text-sm text-gray-400">Acompanhe o desempenho dos seus links com estatísticas de cliques em tempo real.</p>
          </div>
        </div>
        

      </div>
    </div>
  )
}
