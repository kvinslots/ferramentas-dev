'use client'

import { useState } from 'react'
import { saveAs } from 'file-saver'

export default function TypebotConverter({ showNotification }) {
  const [inputData, setInputData] = useState('')
  const [fileName, setFileName] = useState('typebot-export')
  const [converted, setConverted] = useState(null)
  const [error, setError] = useState(null)

  // Função para realizar a conversão de dados
  const convertData = () => {
    try {
      if (!inputData.trim()) {
        showNotification('Por favor, insira os dados para conversão')
        return
      }

      setError(null)
      
      // Tenta fazer o parse dos dados JSON de entrada
      const inputJson = JSON.parse(inputData)
      
      // Verifica se é um array e tem pelo menos um item
      if (!Array.isArray(inputJson) || inputJson.length === 0) {
        throw new Error('O formato de entrada deve ser um array JSON com pelo menos um item')
      }
      
      // Extrai os dados da sessão
      const sessionData = inputJson[0]
      
      // Verifica se o formato é compatível com o esperado
      if (!sessionData.typebot || !sessionData.messages) {
        throw new Error('O formato de entrada não é compatível. Verifique se contém as propriedades necessárias.')
      }
      
      // Monta o objeto de saída com base no formato requerido pelo Typebot
      const typebotExport = {
        version: "6",
        id: sessionData.typebot.id || "typebot_id",
        name: fileName.replace(/\.json$/, ''),
        events: [
          {
            id: "start_event_id",
            outgoingEdgeId: "jrqffesme2qvwxnsfxoqa5xp",
            graphCoordinates: { x: 12, y: 3 },
            type: "start"
          }
        ],
        groups: [
          {
            id: "group1_id",
            title: "Grupo Principal",
            graphCoordinates: { x: 1168.5, y: -381.34 },
            blocks: []
          }
        ],
        edges: [
          {
            id: "edge1",
            from: { blockId: "start_event_id" },
            to: { groupId: "group1_id" }
          },
          {
            id: "jrqffesme2qvwxnsfxoqa5xp",
            from: { eventId: "start_event_id" },
            to: { groupId: "group1_id" }
          }
        ],
        variables: [],
        theme: sessionData.typebot.theme || {},
        selectedThemeTemplateId: null,
        settings: sessionData.typebot.settings || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        icon: null,
        folderId: null,
        publicId: "exportado",
        customDomain: null,
        workspaceId: sessionData.typebot.workspaceId || "workspace_id",
        resultsTablePreferences: null,
        isArchived: false,
        isClosed: false,
        whatsAppCredentialsId: null,
        riskLevel: null
      }
      
      // Adiciona blocos com base nas mensagens
      sessionData.messages.forEach((message, index) => {
        const blockId = message.id || `block_${index}`
        
        let block = {
          id: blockId,
          type: message.type || 'text'
        }
        
        // Adiciona conteúdo específico com base no tipo de mensagem
        if (message.type === 'text') {
          block.content = message.content
        } else if (message.type === 'embed') {
          block.content = message.content
        } else if (message.type === 'image') {
          block.content = message.content
        } else if (message.type === 'audio') {
          block.content = message.content
        } else if (message.type === 'choice input') {
          block.items = message.items
          block.options = message.options || {}
        } else {
          // Para outros tipos, manter o conteúdo original
          block.content = message.content
        }
        
        typebotExport.groups[0].blocks.push(block)
      })
      
      // Adiciona ações do lado do cliente se existirem
      if (sessionData.clientSideActions && sessionData.clientSideActions.length > 0) {
        sessionData.clientSideActions.forEach((action, index) => {
          if (action.type === 'scriptToExecute') {
            const blockId = `script_block_${index}`
            typebotExport.groups[0].blocks.push({
              id: blockId,
              type: 'Code',
              options: {
                content: action.scriptToExecute.content
              }
            })
          } else if (action.type === 'wait') {
            const blockId = `wait_block_${Date.now() + index}`
            typebotExport.groups[0].blocks.push({
              id: blockId,
              type: 'Wait',
              options: {
                secondsToWaitFor: action.wait.secondsToWaitFor.toString()
              }
            })
          }
        })
      }
      
      // Adiciona variáveis encontradas
      const variablesMap = new Map()
      
      // Função para extrair variáveis de texto
      const extractVariablesFromText = (text) => {
        if (!text) return
        
        const matches = text.match(/{{([^}]+)}}/g)
        if (matches) {
          matches.forEach(match => {
            const varName = match.replace(/{{|}}/g, '').trim()
            if (!variablesMap.has(varName)) {
              variablesMap.set(varName, {
                id: `v${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
                name: varName,
                isSessionVariable: true
              })
            }
          })
        }
      }
      
      // Procura por variáveis em mensagens de texto
      sessionData.messages.forEach(message => {
        if (message.type === 'text' && message.content && message.content.richText) {
          message.content.richText.forEach(paragraph => {
            if (paragraph.children) {
              paragraph.children.forEach(child => {
                if (child.text) extractVariablesFromText(child.text)
              })
            }
          })
        }
      })
      
      // Adiciona as variáveis encontradas
      typebotExport.variables = Array.from(variablesMap.values())
      
      // Armazena o resultado convertido
      setConverted(typebotExport)
      showNotification('Conversão realizada com sucesso!')
    } catch (err) {
      console.error('Erro na conversão:', err)
      setError(err.message || 'Ocorreu um erro durante a conversão. Verifique o formato dos dados.')
      showNotification('Erro na conversão. Verifique o formato dos dados.')
    }
  }

  // Função para fazer download do JSON convertido
  const downloadConverted = () => {
    if (!converted) return
    
    const finalFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`
    const jsonStr = JSON.stringify(converted, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    saveAs(blob, finalFileName)
    
    showNotification(`Arquivo ${finalFileName} baixado com sucesso!`)
  }

  // Função para limpar os dados
  const clearData = () => {
    setInputData('')
    setConverted(null)
    setError(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          <span className="text-primary">&gt;</span> Conversor para Typebot
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
        Converta dados JSON para o formato compatível com importação no Typebot.
      </p>

      {/* Área de input */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="text-lg font-semibold">Dados JSON de Entrada:</label>
          {inputData && (
            <button 
              onClick={clearData}
              className="text-sm text-primary hover:underline"
            >
              Limpar
            </button>
          )}
        </div>
        <textarea 
          className="w-full h-64 p-3 bg-card border border-border rounded-md font-mono text-sm"
          placeholder='Cole aqui o JSON com as mensagens do Typebot...'
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
        ></textarea>
      </div>

      {/* Nome do arquivo */}
      <div className="mb-6">
        <label className="text-lg font-semibold block mb-2">Nome do arquivo de saída:</label>
        <input 
          type="text"
          className="w-full p-3 bg-card border border-border rounded-md"
          placeholder="Nome do arquivo (ex: meu-typebot)"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>

      {/* Botões de ação */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          className="btn btn-primary btn-lg"
          onClick={convertData}
          disabled={!inputData.trim()}
        >
          Converter Dados
        </button>
        
        {converted && (
          <button
            className="btn btn-secondary btn-lg"
            onClick={downloadConverted}
          >
            Baixar JSON
          </button>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
          <p className="font-semibold">Erro na conversão:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Visualização do resultado */}
      {converted && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Resultado da Conversão:</h3>
          <div className="bg-card border border-border rounded-md p-4 max-h-96 overflow-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(converted, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-8 bg-card bg-opacity-70 p-4 rounded-md border border-border">
        <h3 className="text-lg font-semibold mb-2">Como usar:</h3>
        <ol className="text-sm space-y-2 list-decimal pl-5">
          <li>Cole o JSON com os dados do Typebot na área de texto acima</li>
          <li>Clique em "Converter Dados" para processar o JSON</li>
          <li>Verifique o resultado da conversão</li>
          <li>Clique em "Baixar JSON" para salvar o arquivo</li>
          <li>No Typebot, use a opção "Importar" e selecione o arquivo baixado</li>
        </ol>
      </div>
      
      <div className="border-t border-border pt-8 mt-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold mb-2">Quer clonar qualquer fluxo do Typebot?</h3>
          <p className="text-gray-400">
            Adquira nossa extensão premium para clonar fluxos completos do Typebot por apenas:
          </p>
          <div className="text-2xl font-bold text-primary mt-2">
            R$ 67,90<span className="text-sm text-gray-400"> (pagamento único vitalício)</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <a 
            href="http://wa.me/5533991244460" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary btn-lg flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
            Adquirir pelo WhatsApp
          </a>
          
          <button 
            className="btn btn-secondary btn-lg"
            onClick={() => {
              showNotification('Entre em contato para mais informações sobre nossa extensão!')
              window.open('http://wa.me/5533991244460', '_blank')
            }}
          >
            Mais Informações
          </button>
        </div>
      </div>
    </div>
  )
}
