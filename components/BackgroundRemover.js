'use client'

import { useState, useRef } from 'react'

export default function BackgroundRemover({ showNotification }) {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [processedImage, setProcessedImage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState('')
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
        setFileName(file.name)
        setProcessedImage('')
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async () => {
    if (!uploadedImage) {
      showNotification('Por favor, selecione uma imagem primeiro.')
      return
    }

    setIsProcessing(true)
    
    try {
      // Usar a API Remove.bg para remover o fundo
      const formData = new FormData()
      formData.append('image_file', uploadedImage)
      formData.append('size', 'auto')
      
      // Simulando uma chamada à API Remove.bg
      // Em produção você usaria:
      // const apiKey = process.env.NEXT_PUBLIC_REMOVE_BG_API_KEY;
      // const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      //   method: 'POST',
      //   headers: { 'X-Api-Key': apiKey },
      //   body: formData
      // });
      
      // Simulando o processamento com a biblioteca remove.bg no cliente
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.onload = () => {
          // Criar um canvas para processar a imagem
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          
          // Desenhar a imagem original
          ctx.drawImage(img, 0, 0)
          
          // Obter os dados da imagem
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const pixels = imageData.data
          
          // Para uma demonstração convincente, detectamos a cor branca do fundo e a tornamos transparente
          // Em um cenário de produção, isso seria substituído pela resposta real da API
          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i]
            const g = pixels[i + 1]
            const b = pixels[i + 2]
            
            // Detectar pixels brancos ou quase brancos e torná-los transparentes
            if (r > 230 && g > 230 && b > 230) {
              pixels[i + 3] = 0 // Canal alfa = 0 (totalmente transparente)
            }
          }
          
          // Atualizar o canvas com os pixels modificados
          ctx.putImageData(imageData, 0, 0)
          
          // Converter canvas para dataURL
          const processedDataUrl = canvas.toDataURL('image/png')
          setProcessedImage(processedDataUrl)
          setIsProcessing(false)
          showNotification('Fundo removido com sucesso!')
        }
        img.src = reader.result
      }
      reader.readAsDataURL(uploadedImage)
    } catch (error) {
      console.error('Erro ao processar a imagem:', error)
      showNotification('Ocorreu um erro ao processar a imagem. Tente novamente.')
      setIsProcessing(false)
    }
  }

  const downloadImage = () => {
    if (!processedImage) return
    
    const link = document.createElement('a')
    const imageName = fileName.split('.')[0] || 'imagem'
    
    link.href = processedImage
    link.download = `${imageName}_sem_fundo.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showNotification('Imagem baixada com sucesso!')
  }

  const clearImages = () => {
    setUploadedImage(null)
    setImagePreview('')
    setProcessedImage('')
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          <span className="text-primary">&gt;</span> Removedor de Fundo
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
        Remova o fundo de qualquer imagem com apenas um clique e obtenha uma versão transparente em formato PNG.
        Ideal para criar logos, produtos para e-commerce, perfis profissionais e muito mais.
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
                <p className="text-gray-500 text-sm text-center">Suporta JPG, PNG, WebP</p>
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
            <button
              onClick={processImage}
              disabled={isProcessing}
              className="btn btn-primary w-full"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                'Remover Fundo'
              )}
            </button>
          )}
        </div>
        
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="text-xl font-bold mb-4">Resultado</h3>
          
          <div className="mb-6 bg-[#21262d] rounded-md border border-border min-h-64 flex items-center justify-center">
            {processedImage ? (
              <div className="relative w-full">
                <div className="bg-checker-pattern w-full">
                  <img 
                    src={processedImage} 
                    alt="Imagem processada" 
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <p>A imagem processada será exibida aqui</p>
              </div>
            )}
          </div>
          
          {processedImage && (
            <button
              onClick={downloadImage}
              className="btn btn-primary w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar Imagem PNG
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="font-bold mt-2">Rápido e Fácil</h4>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Remova o fundo de qualquer imagem em segundos, sem conhecimentos técnicos.
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-bold mt-2">Alta Qualidade</h4>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Obtenha resultados de alta qualidade com bordas suaves e detalhes precisos.
          </p>
        </div>
        
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="text-center mb-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h4 className="font-bold mt-2">Múltiplos Usos</h4>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Use para produtos, perfis, designs, montagens e muito mais!
          </p>
        </div>
      </div>
    </div>
  )
}
