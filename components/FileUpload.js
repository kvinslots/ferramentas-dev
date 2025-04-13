'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export default function FileUpload({ setData, setColumns, setFileName, setVisibleColumns, showNotification }) {
  const [isDragging, setIsDragging] = useState(false)
  const [displayFileName, setDisplayFileName] = useState('')
  const fileInputRef = useRef(null)

  // Função para prevenir comportamento padrão dos eventos de arrastar/soltar
  const preventDefaults = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Manipuladores de eventos para drag and drop
  const handleDragEnter = (e) => {
    preventDefaults(e)
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    preventDefaults(e)
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    preventDefaults(e)
    setIsDragging(true)
  }

  const handleDrop = (e) => {
    preventDefaults(e)
    setIsDragging(false)
    
    const dt = e.dataTransfer
    const files = dt.files
    
    if (files.length) {
      handleFiles(files)
    }
  }

  // Função para lidar com a seleção de arquivos por input
  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files.length) {
      handleFiles(files)
    }
  }

  // Função para processar arquivos
  const handleFiles = (files) => {
    const file = files[0]
    setFileName(file.name)
    setDisplayFileName(file.name)
    
    const fileExtension = file.name.split('.').pop().toLowerCase()
    
    if (fileExtension === 'csv') {
      parseCSV(file)
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      parseExcel(file)
    } else {
      showNotification('Formato de arquivo não suportado. Use CSV ou Excel.')
    }
  }

  // Função para importar CSV
  const parseCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        processData(results.data, Object.keys(results.data[0] || {}))
      },
      error: (error) => {
        showNotification(`Erro ao processar o arquivo CSV: ${error.message}`)
      }
    })
  }

  // Função para importar Excel
  const parseExcel = (file) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Pega a primeira planilha
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        
        // Converte para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        
        if (jsonData.length < 2) {
          showNotification('O arquivo Excel está vazio ou não contém dados válidos.')
          return
        }
        
        // A primeira linha contém os cabeçalhos
        const headers = jsonData[0]
        
        // Restante são os dados
        const rows = jsonData.slice(1).map(row => {
          const rowData = {}
          headers.forEach((header, index) => {
            rowData[header] = row[index] === undefined ? '' : row[index]
          })
          return rowData
        })
        
        processData(rows, headers)
      } catch (error) {
        showNotification(`Erro ao processar o arquivo Excel: ${error.message}`)
      }
    }
    
    reader.onerror = () => {
      showNotification('Erro ao ler o arquivo Excel.')
    }
    
    reader.readAsArrayBuffer(file)
  }

  // Processa os dados importados
  const processData = (dataArray, columnsArray) => {
    if (dataArray.length === 0) {
      showNotification('O arquivo não contém dados válidos.')
      return
    }

    setData(dataArray)
    setColumns(columnsArray)
    setVisibleColumns(columnsArray)
    
    showNotification(`Importados ${dataArray.length} registros com ${columnsArray.length} colunas.`)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Importar Arquivo</h2>
      
      <div 
        className={`upload-area ${isDragging ? 'dragover' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <p>Arraste e solte um arquivo CSV ou Excel aqui</p>
        <p className="text-gray-500 my-3">ou</p>
        <button className="btn btn-primary">Selecionar Arquivo</button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".csv,.xls,.xlsx"
          onChange={handleFileSelect}
        />
      </div>
      
      {displayFileName && (
        <div className="mt-4 text-center text-gray-400 italic">
          Arquivo: {displayFileName}
        </div>
      )}

      <div className="mt-4 text-center text-gray-400 text-sm">
        Arquivos suportados: CSV, Excel (.xlsx)
      </div>
    </div>
  )
}
