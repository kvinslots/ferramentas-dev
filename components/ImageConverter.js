'use client'

import { useState, useRef } from 'react'

export default function ImageConverter({ showNotification }) {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [convertedImage, setConvertedImage] = useState('')
  const [targetFormat, setTargetFormat] = useState('webp')
  const [quality, setQuality] = useState(85)
  const [fileName, setFileName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Verifica se é uma imagem
      if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecione um arquivo de imagem válido.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setUploadedImage(file)
        setImagePreview(reader.result)
        setFileName(file.name.split('.')[0] || 'imagem')
        setConvertedImage('')
      }
      reader.readAsDataURL(file)
    }
  }

  const convertImage = async () => {
    if (!uploadedImage) {
      showNotification('Por favor, selecione uma imagem primeiro.')
      return
    }

    setIsProcessing(true)
    
    try {
      // Criar um canvas para processar a imagem
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.width
        canvas.height = img.height
        
        // Desenhar a imagem no canvas
        ctx.drawImage(img, 0, 0)
        
        // Obter o tipo MIME correto com base no formato selecionado
        let mimeType = 'image/jpeg'
        switch(targetFormat) {
          case 'png':
            mimeType = 'image/png'
            break
          case 'webp':
            mimeType = 'image/webp'
            break
          case 'jpg':
          default:
            mimeType = 'image/jpeg'
            break
        }
        
        // Converter a imagem para o formato desejado
        const qualityValue = quality / 100
        const convertedDataUrl = canvas.toDataURL(mimeType, qualityValue)
        setConvertedImage(convertedDataUrl)
        setIsProcessing(false)
        showNotification(`Imagem convertida para ${targetFormat.toUpperCase()} com sucesso!`)
      }
      
      img.src = imagePreview
    } catch (error) {
      console.error('Erro ao converter a imagem:', error)
      showNotification('Ocorreu um erro ao converter a imagem. Tente novamente.')
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!convertedImage) return
    
    const link = document.createElement('a')
    link.href = convertedImage
    link.download = `${fileName}_convertido.${targetFormat}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showNotification('Imagem baixada com sucesso!')
  }

  const clearImages = () => {
    setUploadedImage(null)
    setImagePreview('')
    setConvertedImage('')
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatInfo = {
    jpg: {
      name: 'JPEG',
      desc: 'Melhor para fotografias. Menor tamanho, mas com perda de qualidade.',
      icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
    },
    png: {
      name: 'PNG',
      desc: 'Melhor para gráficos e imagens com transparência. Sem perda de qualidade.',
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
    },
    webp: {
      name: 'WebP',
      desc: 'Formato moderno com melhor compressão. Menor tamanho e alta qualidade.',
      icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          <span className="text-primary">&gt;</span> Conversor de Imagens
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
      
      <p className="text-gray-300 mb-8 max-w-3xl">
        Converta imagens entre diferentes formatos (JPG, PNG, WebP) com controle de qualidade.
        Ideal para otimizar imagens para web, aplicativos ou redes sociais.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-bold mb-4">Upload da Imagem</h3>
          
          <div className="mb-6">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              ref={fileInputRef}
            />
            
            {!imagePreview ? (
              <label 
                htmlFor="image-upload" 
                className="border-2 border-dashed border-primary rounded-md p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-300 text-center mb-2">Clique para selecionar uma imagem</p>
                <p className="text-gray-500 text-sm text-center">Suporta JPG, PNG, WebP, GIF</p>
              </label>
            ) : (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-auto rounded-md border border-border object-contain max-h-64"
                />
                <button
                  onClick={clearImages}
                  className="absolute top-2 right-2 bg-danger p-1 rounded-full"
                  title="Remover imagem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {imagePreview && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Formato de Saída
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(formatInfo).map(format => (
                    <button
                      key={format}
                      onClick={() => setTargetFormat(format)}
                      className={`p-2 rounded text-center transition-colors ${targetFormat === format ? 'bg-primary/20 border border-primary' : 'bg-[#21262d] border border-border hover:bg-[#2d333b]'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={formatInfo[format].icon} />
                      </svg>
                      <span className="text-sm font-medium">{formatInfo[format].name}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {targetFormat !== 'png' && (
                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-400 mb-1">
                    <span>Qualidade: {quality}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={quality} 
                    onChange={(e) => setQuality(parseInt(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#21262d]"
                  />
                </div>
              )}
              
              <button
                onClick={convertImage}
                disabled={isProcessing}
                className="btn btn-primary w-full mt-4"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Convertendo...
                  </>
                ) : (
                  'Converter Imagem'
                )}
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-bold mb-4">Resultado</h3>
          
          <div className="text-xs text-gray-400 mb-2">Formato selecionado: {formatInfo[targetFormat].name}</div>
          <div className="text-xs text-gray-400 mb-4">{formatInfo[targetFormat].desc}</div>
          
          <div className="mb-6 bg-[#21262d] rounded-md border border-border min-h-64 flex items-center justify-center">
            {convertedImage ? (
              <div className="relative w-full">
                <img 
                  src={convertedImage} 
                  alt="Imagem convertida" 
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            ) : (
              <div className="text-gray-500 text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>A imagem convertida será exibida aqui</p>
              </div>
            )}
          </div>
          
          {convertedImage && (
            <button
              onClick={downloadImage}
              className="btn btn-primary w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar Imagem {targetFormat.toUpperCase()}
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="font-bold mt-2">Múltiplos Formatos</h4>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Converta entre JPG, PNG e WebP de acordo com suas necessidades.
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <h4 className="font-bold mt-2">Processamento Local</h4>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Conversão rápida e segura direto no navegador, sem upload para servidores.
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h4 className="font-bold mt-2">Controle de Qualidade</h4>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Ajuste a qualidade para encontrar o equilíbrio perfeito entre tamanho e nitidez.
          </p>
        </div>
      </div>
    </div>
  )
}
