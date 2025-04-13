'use client'

import { useState, useRef, useEffect } from 'react'

export default function QrCodeGenerator({ showNotification }) {
  const [url, setUrl] = useState('')
  const [logo, setLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [qrSize, setQrSize] = useState(250)
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [cornerRadius, setCornerRadius] = useState(0)
  const [loading, setLoading] = useState(false)
  const [qrCodeImage, setQrCodeImage] = useState('')
  const canvasRef = useRef(null)
  
  const handleUrlChange = (e) => {
    setUrl(e.target.value)
  }
  
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(file)
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const removeLogo = () => {
    setLogo(null)
    setLogoPreview('')
  }
  
  const generateQRCode = async (e) => {
    e && e.preventDefault()
    
    if (!url) {
      showNotification('Por favor, insira uma URL válida')
      return
    }
    
    try {
      // Validar URL
      new URL(url)
    } catch (err) {
      showNotification('URL inválida. Certifique-se de incluir http:// ou https://')
      return
    }
    
    setLoading(true)
    
    // Simulação da geração do QR Code (em produção, usar uma biblioteca como qrcode.js)
    // Esta é uma simulação para fins de demonstração
    setTimeout(() => {
      // Criamos um QR code simulado usando um serviço externo
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=${qrSize}x${qrSize}&color=${foregroundColor.replace('#', '')}&bgcolor=${backgroundColor.replace('#', '')}`
      
      setQrCodeImage(apiUrl)
      setLoading(false)
      showNotification('QR Code gerado com sucesso!')
    }, 1500)
  }
  
  const downloadQRCode = () => {
    if (!qrCodeImage) return
    
    const link = document.createElement('a')
    link.href = qrCodeImage
    link.download = 'qrcode.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showNotification('QR Code baixado com sucesso!')
  }
  
  const qrCodeExamples = [
    {
      title: "Cartão de Visita",
      desc: "QR Code com seus dados de contato",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      )
    },
    {
      title: "Link do Instagram",
      desc: "Acesso rápido ao seu perfil",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    {
      title: "Menu Digital",
      desc: "Cardápio online para restaurantes",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    }
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          <span className="text-primary">&gt;</span> Gerador de QR Code
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
      
      <p className="text-center mb-8 text-gray-300 max-w-3xl mx-auto">
        Crie QR Codes personalizados para compartilhar links, informações de contato, cardápios digitais e muito mais.
        Personalize cores, tamanho e adicione seu logotipo para uma experiência única.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-lg font-bold mb-4">Personalize seu QR Code</h3>
          
          <form onSubmit={generateQRCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">URL ou Texto</label>
              <input
                type="text"
                className="w-full bg-input border border-border text-black px-3 py-2 rounded-md focus:outline-none focus:border-primary"
                placeholder="https://exemplo.com.br"
                value={url}
                onChange={handleUrlChange}
                required
              />
              <p className="text-xs text-gray-400 mt-1">Insira o link ou texto que deseja no QR Code</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Cor do QR Code</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    className="h-8 w-8 bg-input border border-border rounded cursor-pointer"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-grow bg-input border border-border text-black px-3 py-1 rounded-md focus:outline-none focus:border-primary"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cor de Fundo</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    className="h-8 w-8 bg-input border border-border rounded cursor-pointer"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-grow bg-input border border-border text-black px-3 py-1 rounded-md focus:outline-none focus:border-primary"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Tamanho (px): {qrSize}</label>
              <input
                type="range"
                className="w-full"
                min="100"
                max="500"
                step="10"
                value={qrSize}
                onChange={(e) => setQrSize(Number(e.target.value))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Adicionar Logotipo (opcional)</label>
              {!logoPreview ? (
                <div className="border-2 border-dashed border-border p-4 text-center rounded-md">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Clique para fazer upload</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-24 w-auto mx-auto rounded border border-border"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-danger p-1 rounded-full"
                    onClick={removeLogo}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando...
                </>
              ) : (
                'Gerar QR Code'
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-4">Visualização</h3>
            
            <div className="flex items-center justify-center p-4 min-h-[250px] bg-[#21262d] rounded-md border border-border mb-4">
              {qrCodeImage ? (
                <img src={qrCodeImage} alt="QR Code" className="max-w-full" />
              ) : (
                <div className="text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p>O QR Code será exibido aqui</p>
                </div>
              )}
            </div>
          </div>
          
          {qrCodeImage && (
            <button
              onClick={downloadQRCode}
              className="btn btn-primary w-full mt-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar QR Code
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-12">
        <h3 className="text-xl font-bold mb-6 text-center">Exemplos de uso para QR Codes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {qrCodeExamples.map((example, index) => (
            <div key={index} className="bg-card p-6 rounded-lg border border-border text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                {example.icon}
              </div>
              <h4 className="font-bold mb-2">{example.title}</h4>
              <p className="text-sm text-gray-400">{example.desc}</p>
            </div>
          ))}
        </div>
      </div>
      

    </div>
  )
}
