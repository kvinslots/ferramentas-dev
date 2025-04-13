'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function DataTable({ 
  data, 
  columns, 
  setData, 
  fileName, 
  visibleColumns, 
  setVisibleColumns,
  showNotification,
  setActiveTab // Adicionando prop para navegação de volta
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [selectedColumn, setSelectedColumn] = useState(null)
  const [columnSearch, setColumnSearch] = useState('')
  const [filteredColumns, setFilteredColumns] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [searchType, setSearchType] = useState('nome')
  const [filteredData, setFilteredData] = useState([])
  const [selectedRows, setSelectedRows] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [focusedRow, setFocusedRow] = useState(null)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Atualiza colunas filtradas quando as colunas mudam
  useEffect(() => {
    setFilteredColumns(columns)
    setFilteredData(data)
  }, [columns, data])

  // Filtra colunas com base na pesquisa
  useEffect(() => {
    if (columnSearch.trim() === '') {
      setFilteredColumns(columns)
    } else {
      const filtered = columns.filter(col => 
        col.toLowerCase().includes(columnSearch.toLowerCase())
      )
      setFilteredColumns(filtered)
    }
  }, [columnSearch, columns])
  
  // Filtra dados com base na pesquisa
  useEffect(() => {
    if (searchInput.trim() === '') {
      setFilteredData(data)
      setShowSearchResults(false)
    } else {
      setShowSearchResults(true)
      const searchTermLower = searchInput.toLowerCase()
      // Adicionar o índice original ao filtrar
      const filtered = data.map((row, originalIndex) => ({
        ...row,
        _originalIndex: originalIndex // Armazenar o índice original do item no array de dados completo
      })).filter(row => {
        // Pesquisa em qualquer campo se a coluna for 'todos'
        if (searchType === 'todos') {
          return Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchTermLower)
          )
        }
        
        // Caso contrário, procure colunas específicas que podem conter o texto de pesquisa
        // Nome
        if (searchType === 'nome') {
          return Object.keys(row).some(key => {
            const keyLower = key.toLowerCase()
            return (keyLower.includes('nome') || keyLower.includes('name')) && 
                  String(row[key]).toLowerCase().includes(searchTermLower)
          })
        }
        
        // CPF
        if (searchType === 'cpf') {
          return Object.keys(row).some(key => {
            const keyLower = key.toLowerCase()
            return keyLower.includes('cpf') && 
                  String(row[key]).toLowerCase().includes(searchTermLower)
          })
        }
        
        // Telefone
        if (searchType === 'telefone') {
          return Object.keys(row).some(key => {
            const keyLower = key.toLowerCase()
            return (keyLower.includes('telefone') || keyLower.includes('phone') || keyLower.includes('celular') || keyLower.includes('tel')) && 
                  String(row[key]).toLowerCase().includes(searchTermLower)
          })
        }
        
        return false
      })
      setFilteredData(filtered)
    }
  }, [searchInput, searchType, data])
  
  // Gerenciar seleção de todas as linhas
  useEffect(() => {
    if (selectAll) {
      setSelectedRows(filteredData.map((_, index) => index))
    } else {
      setSelectedRows([])
    }
  }, [selectAll, filteredData])
  
  // Efeito para rolar até a linha em foco
  useEffect(() => {
    if (focusedRow !== null) {
      const rowElement = document.getElementById(`table-row-${focusedRow}`)
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        rowElement.classList.add('highlight-row')
        
        // Remove o highlight após 2 segundos
        setTimeout(() => {
          rowElement.classList.remove('highlight-row')
          setFocusedRow(null)
        }, 2000)
      }
    }
  }, [focusedRow])
  
  // Função para focar em uma linha específica
  const focusOnRow = (index) => {
    setFocusedRow(index)
  }

  // Função para ordenar dados
  const sortData = (key) => {
    let direction = 'ascending'
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    
    const sortedData = [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1
      }
      return 0
    })
    
    setData(sortedData)
    setSortConfig({ key, direction })
  }

  // Função para remover duplicatas baseadas em uma coluna específica
  const removeDuplicates = (column) => {
    if (!column) return
    
    const uniqueMap = new Map()
    
    data.forEach(item => {
      const key = item[column]
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item)
      }
    })
    
    const uniqueData = Array.from(uniqueMap.values())
    setData(uniqueData)
    
    // Mostrar mensagem ou feedback visual
    showNotification(`Removidas ${data.length - uniqueData.length} duplicatas baseadas em ${column}`)
  }

  // Função para formatar datas e ajustar horários para GMT-3 (Brasília)
  const formatDataForExport = (dataToFormat) => {
    return dataToFormat.map(row => {
      const newRow = {...row}
      
      // Procurar campos de data/hora e formatá-los
      Object.keys(row).forEach(key => {
        const value = String(row[key] || '')
        
        // Detectar se é um campo de data
        if (
          (key.toLowerCase().includes('data') || key.toLowerCase().includes('date')) ||
          // Verificar padrões comuns de data
          /\d{4}-\d{2}-\d{2}/.test(value) || /\d{2}\/\d{2}\/\d{4}/.test(value)
        ) {
          try {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
              newRow[key] = new Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }).format(date)
            }
          } catch (e) {
            // Manter o valor original se não conseguir converter
          }
        }
        
        // Detectar se é um campo de hora e ajustar para GMT-3
        if (
          (key.toLowerCase().includes('hora') || key.toLowerCase().includes('time')) ||
          /\d{2}:\d{2}(:\d{2})?/.test(value)
        ) {
          try {
            const date = new Date(value)
            if (!isNaN(date.getTime())) {
              // Ajustar para GMT-3 (Brasília)
              const brazilTime = new Date(date.getTime() - 3 * 60 * 60 * 1000)
              newRow[key] = new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'America/Sao_Paulo'
              }).format(brazilTime)
            }
          } catch (e) {
            // Manter o valor original se não conseguir converter
          }
        }
      })
      
      return newRow
    })
  }
  
  // Função para exportar dados
  const exportData = (format) => {
    // Filtramos os dados para incluir apenas as colunas visíveis e formatamos as datas
    const filteredData = data.map(row => {
      const filteredRow = {}
      visibleColumns.forEach(col => {
        filteredRow[col] = row[col]
      })
      return filteredRow
    })

    const formattedData = formatDataForExport(filteredData)
    const baseFileName = fileName.split('.')[0] || 'dados'
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19)
    const exportFileName = `${baseFileName}_${timestamp}`

    try {
      if (format === 'csv') {
        const csv = Papa.unparse(formattedData)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        saveAs(blob, `${exportFileName}.csv`)
      } 
      else if (format === 'xlsx') {
        // Cria um array com cabeçalhos e dados
        const wsData = [visibleColumns]
        formattedData.forEach(row => {
          const rowData = visibleColumns.map(col => row[col])
          wsData.push(rowData)
        })
        
        // Cria uma planilha
        const ws = XLSX.utils.aoa_to_sheet(wsData)
        
        // Cria um workbook e adiciona a planilha
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Dados')
        
        // Gera o arquivo e faz o download
        XLSX.writeFile(wb, `${exportFileName}.xlsx`)
      }
      else if (format === 'txt') {
        // Cria um texto formatado com os dados
        let txtContent = ''
        
        // Cabeçalho
        txtContent += visibleColumns.join('\t') + '\n'
        txtContent += visibleColumns.map(() => '---').join('\t') + '\n'
        
        // Dados
        formattedData.forEach(row => {
          txtContent += visibleColumns.map(col => row[col]).join('\t') + '\n'
        })
        
        // Cria um blob e faz o download
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' })
        saveAs(blob, `${exportFileName}.txt`)
      }

      showNotification(`Dados exportados com sucesso para ${exportFileName}.${format}`)
    } catch (error) {
      console.error('Erro ao exportar:', error)
      showNotification(`Erro ao exportar os dados: ${error.message}`)
    }
  }

  // Função para toggle de colunas visíveis
  const toggleColumnVisibility = (column) => {
    if (visibleColumns.includes(column)) {
      // Não permita ocultar todas as colunas
      if (visibleColumns.length > 1) {
        setVisibleColumns(visibleColumns.filter(col => col !== column))
      } else {
        showNotification('Pelo menos uma coluna deve permanecer visível.')
      }
    } else {
      setVisibleColumns([...visibleColumns, column])
    }
  }

  // Função para remover uma linha de dados
  const removeRow = (index) => {
    const newData = [...data]
    newData.splice(index, 1)
    setData(newData)
    showNotification(`Linha ${index + 1} removida com sucesso`)
  }
  
  // Função para alternar a seleção de uma linha
  const toggleRowSelection = (index) => {
    setSelectedRows(prev => {
      const isSelected = prev.includes(index)
      if (isSelected) {
        return prev.filter(i => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }
  
  // Função para remover múltiplas linhas
  const removeSelectedRows = () => {
    if (selectedRows.length === 0) return
    
    // Ordena os índices em ordem decrescente para não afetar os índices subsequentes ao remover
    const sortedIndices = [...selectedRows].sort((a, b) => b - a)
    
    const newData = [...data]
    sortedIndices.forEach(index => {
      newData.splice(index, 1)
    })
    
    setData(newData)
    setSelectedRows([])
    setSelectAll(false)
    showNotification(`Removidas ${selectedRows.length} linhas com sucesso`)
  }

  // Função para identificar as colunas padrão (nome, telefone, cpf)
  const getDefaultColumns = () => {
    const defaultPatterns = [
      /nome/i, /name/i,
      /telefone/i, /tel/i, /fone/i, /celular/i, /phone/i,
      /cpf/i, /cnpj/i, /documento/i, /doc/i, /identity/i, /id/i,
      /email/i, /e-mail/i, /mail/i,
      /endereco/i, /address/i
    ]
    
    return columns.filter(column => 
      defaultPatterns.some(pattern => pattern.test(column))
    )
  }

  // Função para mostrar apenas colunas específicas
  const showOnlyColumns = (columnsToShow) => {
    setVisibleColumns(columnsToShow)
  }

  // Função para marcar todas as colunas como visíveis
  const showAllColumns = () => {
    setVisibleColumns([...columns])
    showNotification('Mostrando todas as colunas')
  }

  return (
    <div>
      {/* Botão Voltar */}
      <div className="mb-4">
        <button
          onClick={() => setActiveTab('home')}
          className="btn btn-outline flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para Home
        </button>
      </div>
      {/* Barra de pesquisa */}
      <div className="pb-4 mb-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-grow">
            <div className="input-group">
              <div className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Pesquisar por nome, CPF ou telefone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field"
              />
              {searchInput && (
                <button 
                  onClick={() => setSearchInput('')}
                  className="input-clear-btn"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
          <div className="sm:w-1/3 lg:w-1/4">
            <select 
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="input-field"
            >
              <option value="nome">Nome</option>
              <option value="cpf">CPF</option>
              <option value="telefone">Telefone</option>
              <option value="todos">Todos os campos</option>
            </select>
          </div>
        </div>
        
        {selectedRows.length > 0 && (
          <div className="flex items-center justify-between bg-primary bg-opacity-10 p-3 rounded-md mb-4">
            <div className="flex items-center">
              <span className="font-semibold">{selectedRows.length} linha(s) selecionada(s)</span>
            </div>
            <button 
              onClick={removeSelectedRows}
              className="btn btn-danger btn-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Excluir Selecionados
            </button>
          </div>
        )}
        
        {showSearchResults && searchInput.trim() !== '' && (
          <div className="bg-card border border-border p-3 rounded-md mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">
                {filteredData.length === 0 ? (
                  <span className="text-red-500">Nenhum resultado encontrado</span>
                ) : (
                  <span>
                    <span className="text-primary">{filteredData.length}</span> resultado(s) encontrado(s) para: 
                    <span className="text-primary ml-1">"{searchInput}"</span>
                  </span>
                )}
              </div>
              <button 
                onClick={() => setShowSearchResults(false)}
                className="text-sm text-gray-400 hover:text-white"
              >
                Ocultar detalhes
              </button>
            </div>
            
            {filteredData.length > 0 && filteredData.length <= 10 && (
              <div className="mt-2 max-h-48 overflow-y-auto">
                <div className="text-sm text-gray-400 mb-1">Resultados rápidos:</div>
                <ul className="space-y-1">
                  {filteredData.map((row, index) => {
                    // Busca o valor que corresponde à pesquisa
                    const matchKey = Object.keys(row).find(key => {
                      if (key === '_originalIndex') return false; // Ignorar campo interno
                      
                      if (searchType === 'todos') {
                        return String(row[key]).toLowerCase().includes(searchInput.toLowerCase())
                      } else if (searchType === 'nome') {
                        const keyLower = key.toLowerCase()
                        return (keyLower.includes('nome') || keyLower.includes('name')) && 
                              String(row[key]).toLowerCase().includes(searchInput.toLowerCase())
                      } else if (searchType === 'cpf') {
                        const keyLower = key.toLowerCase()
                        return keyLower.includes('cpf') && 
                              String(row[key]).toLowerCase().includes(searchInput.toLowerCase())
                      } else if (searchType === 'telefone') {
                        const keyLower = key.toLowerCase()
                        return (keyLower.includes('telefone') || keyLower.includes('phone') || keyLower.includes('celular') || keyLower.includes('tel')) && 
                              String(row[key]).toLowerCase().includes(searchInput.toLowerCase())
                      }
                      return false
                    }) || Object.keys(row).filter(k => k !== '_originalIndex')[0]
                    
                    return (
                      <li key={index} className="bg-[#21262d] p-2 rounded hover:bg-[#2d333b] flex justify-between items-center">
                        <div>
                          <span className="text-primary font-mono">Linha {row._originalIndex + 1}:</span>{' '}
                          <span className="font-medium">{String(row[matchKey])}</span>
                        </div>
                        <button
                          onClick={() => focusOnRow(index)}
                          className="btn btn-primary btn-sm py-1 px-2 text-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                          </svg>
                          Ir para
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            
            {filteredData.length > 20 && (
              <div className="mt-2 text-sm text-gray-400">
                Muitos resultados. Use a tabela abaixo para visualizar todos os {filteredData.length} itens.
              </div>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Controle de colunas */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Colunas</h3>
            <div className="flex space-x-2">
              <button 
                className="btn btn-secondary text-sm"
                onClick={() => showOnlyColumns(getDefaultColumns())}
              >
                Padrão
              </button>
              <button 
                className="btn btn-secondary text-sm"
                onClick={showAllColumns}
              >
                Mostrar Todas
              </button>
            </div>
          </div>
          
          <div className="mb-3">
            <input
              type="text"
              className="w-full p-2 bg-background border border-border rounded"
              placeholder="Filtrar colunas..."
              value={columnSearch}
              onChange={(e) => setColumnSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-card border border-border rounded">
            {filteredColumns.map(column => (
              <div 
                key={column}
                className={`column-toggle ${visibleColumns.includes(column) ? 'active' : ''}`}
                onClick={() => toggleColumnVisibility(column)}
              >
                {column}
              </div>
            ))}
          </div>
        </div>
        
        {/* Opções de manipulação */}
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Remover Duplicatas</h3>
            <div className="flex gap-2">
              <select 
                className="flex-grow p-2 bg-background border border-border rounded"
                value={selectedColumn || ''}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                <option value="">Selecione uma coluna</option>
                {columns.map(column => (
                  <option key={column} value={column}>{column}</option>
                ))}
              </select>
              <button 
                className="btn btn-secondary whitespace-nowrap"
                onClick={() => removeDuplicates(selectedColumn)}
                disabled={!selectedColumn}
              >
                Remover
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Exportar Dados</h3>
            <div className="grid grid-cols-3 gap-2">
              <button 
                className="btn btn-primary"
                onClick={() => exportData('csv')}
              >
                &gt; CSV
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => exportData('xlsx')}
              >
                &gt; XLSX
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => exportData('txt')}
              >
                &gt; TXT
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contador de registros */}
      <div className="flex justify-between items-center py-2 px-3 bg-card border border-border rounded-md mb-3">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <span className="font-semibold">Total de registros:</span>
          <span className="ml-2 bg-primary bg-opacity-20 text-primary px-2 py-1 rounded-md font-mono">{filteredData.length}</span>
          {filteredData.length !== data.length && (
            <span className="ml-2 text-sm text-gray-400">
              (de {data.length} total)
            </span>
          )}
        </div>
        {sortConfig.key && (
          <div className="text-sm text-gray-400">
            Ordenado por <span className="text-primary font-medium">{sortConfig.key}</span> ({sortConfig.direction === 'ascending' ? 'crescente' : 'decrescente'})
          </div>
        )}
      </div>

      {/* Tabela de dados */}
      <div className="table-container mt-2">
        <table>
          <thead>
            <tr>
              <th className="w-10 text-center">
                <input 
                  type="checkbox"
                  checked={selectAll && filteredData.length > 0}
                  onChange={() => setSelectAll(!selectAll)}
                  className="form-checkbox h-4 w-4"
                />
              </th>
              <th className="w-12 text-center">#</th>
              {visibleColumns.map(column => (
                <th 
                  key={column}
                  onClick={() => sortData(column)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column}</span>
                    {sortConfig.key === column && (
                      <span className="ml-1">
                        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => {
                const isSelected = selectedRows.includes(index);
                return (
                  <tr 
                    key={index} 
                    id={`table-row-${index}`}
                    className={`animate-fade-in ${isSelected ? 'bg-primary bg-opacity-10' : ''}`} 
                    style={{ animationDelay: `${index * 0.03}s` }}
                    data-original-index={row._originalIndex !== undefined ? row._originalIndex + 1 : index + 1}
                  >
                    <td className="text-center">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRowSelection(index)}
                        className="form-checkbox h-4 w-4"
                      />
                    </td>
                    <td className="text-center text-gray-500">{row._originalIndex !== undefined ? row._originalIndex + 1 : index + 1}</td>
                    {visibleColumns.map(column => (
                      <td key={`${index}-${column}`}>
                        {row[column] !== undefined ? String(row[column]) : ''}
                      </td>
                    ))}
                    <td>
                      <button 
                        onClick={() => removeRow(index)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        title="Remover linha"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={visibleColumns.length + 3} className="text-center py-4">
                  {searchInput.trim() !== '' ? 'Nenhum resultado encontrado para sua pesquisa.' : 'Não há dados para exibir.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
