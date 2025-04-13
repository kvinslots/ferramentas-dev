'use client'

import { useState } from 'react'

export default function MetadataRemover({ showNotification }) {
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  // Manipula o upload de arquivos
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files)
    setFiles(prev => [...prev, ...newFiles])
  }

  // Remove um arquivo da lista
  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  // Simulação da remoção de metadados (em ambiente de produção, usaria uma biblioteca real)
  const processFiles = async () => {
    if (files.length === 0) {
      showNotification('Adicione arquivos para processar')
      return
    }

    setProcessing(true)
    setProgress(0)

    // Simulação de processamento
    const totalFiles = files.length
    
    for (let i = 0; i < totalFiles; i++) {
      // Simular processamento de cada arquivo
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Atualizar progresso
      setProgress(Math.floor(((i + 1) / totalFiles) * 100))
    }

    // Em um ambiente real, aqui usaríamos exiftool, ffmpeg ou outra biblioteca
    // para remover os metadados e criar novos arquivos

    setTimeout(() => {
      showNotification('Metadados removidos com sucesso!')
      
      // Criar URLs de download para os arquivos processados
      const processedFiles = files.map(file => {
        // Em produção, este seria o arquivo com metadados removidos
        return {
          originalName: file.name,
          // Em produção, aqui seria o URL para o arquivo processado
          // Agora apenas usamos o mesmo arquivo para demonstrar a interface
          url: URL.createObjectURL(file),
          size: file.size,
          type: file.type
        }
      })
      
      setFiles(processedFiles)
      setProcessing(false)
    }, 500)
  }

  // Formatador de tamanho de arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          <span className="text-primary">&gt;</span> Removedor de Metadados
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
      
      <p className="mb-4 text-center">
        Remova metadados de suas imagens e vídeos sem perder qualidade.
      </p>

      {/* Área de upload */}
      <div className={`upload-area ${files.length > 0 ? 'has-files' : ''}`}>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileChange}
          multiple
          accept="image/*,video/*"
        />
        <label htmlFor="file-upload" className="upload-label">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <svg className="w-12 h-12 text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg mb-1">Arraste arquivos ou clique para selecionar</p>
            <p className="text-sm text-gray-500">Imagens (JPG, PNG, GIF, WEBP) e Vídeos (MP4, MOV, AVI)</p>
          </div>
        </label>
      </div>

      {/* Lista de arquivos */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {files.length} {files.length === 1 ? 'arquivo' : 'arquivos'} selecionado(s)
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setFiles([])}
            >
              Limpar Todos
            </button>
          </div>

          <ul className="file-list">
            {files.map((file, index) => (
              <li key={index} className="file-item">
                <div className="flex items-center">
                  <div className="file-icon">
                    {file.type.startsWith('image/') ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="file-info">
                    <span className="file-name">{file.name || file.originalName}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  {file.url ? (
                    <a
                      href={file.url}
                      download={file.originalName}
                      className="btn btn-primary btn-sm ml-auto"
                    >
                      Baixar
                    </a>
                  ) : (
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 ml-auto"
                      title="Remover arquivo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Barra de progresso */}
      {processing && (
        <div className="mt-6">
          <div className="progress-label">
            <span>Processando...</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Botão de processar */}
      <div className="mt-6 flex justify-center">
        <button
          className="btn btn-primary btn-lg"
          onClick={processFiles}
          disabled={files.length === 0 || processing || files.some(f => f.url)}
        >
          {processing ? 'Processando...' : files.some(f => f.url) ? 'Processado' : 'Remover Metadados'}
        </button>
      </div>

      {/* Explicação sobre metadados */}
      <div className="mt-8 bg-card bg-opacity-70 p-4 rounded-md border border-border">
        <h3 className="text-lg font-semibold mb-2">O que são metadados?</h3>
        <p className="text-sm">
          Metadados são informações ocultas em arquivos de mídia como imagens e vídeos. 
          Eles podem incluir dados como localização GPS, data/hora, modelo da câmera, 
          configurações da câmera e até informações do dispositivo. 
          Remover metadados ajuda a proteger sua privacidade ao compartilhar arquivos online.
        </p>
      </div>
    </div>
  )
}
