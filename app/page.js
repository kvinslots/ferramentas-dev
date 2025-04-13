'use client'

import { useState } from 'react'
import MatrixBackground from '../components/MatrixBackground'
import FileUpload from '../components/FileUpload'
import DataTable from '../components/DataTable'
import Notification from '../components/Notification'
import MetadataRemover from '../components/MetadataRemover'
import TypebotConverter from '../components/TypebotConverter'
import CpfConsulta from '../components/CpfConsulta'
import LinkShortener from '../components/LinkShortener'
import HomePage from '../components/HomePage'
import QrCodeGenerator from '../components/QrCodeGenerator'
import BackgroundRemover from '../components/BackgroundRemover'
import ImageConverter from '../components/ImageConverter'
import HtmlEditor from '../components/HtmlEditor'
import './globals.css'

export default function Home() {
  const [data, setData] = useState([])
  const [columns, setColumns] = useState([])
  const [fileName, setFileName] = useState('')
  const [visibleColumns, setVisibleColumns] = useState([])
  const [notification, setNotification] = useState({ show: false, message: '' })
  const [activeTab, setActiveTab] = useState('home')

  // Função para mostrar notificação
  const showNotification = (message) => {
    setNotification({ show: true, message })
    setTimeout(() => {
      setNotification({ show: false, message: '' })
    }, 3000)
  }

  return (
    <main className="min-h-screen">
      <MatrixBackground />
      
      <div className="header">
        <h1 
          className="text-4xl font-bold text-center text-white tracking-wider cursor-pointer transition-all hover:scale-105"
          onClick={() => setActiveTab('home')}
        >
          <span className="text-primary">&gt;</span> FERRAMENTAS DEV
        </h1>
        <p className="text-center text-lg mt-2 text-primary tracking-wide">
          [ Sistema profissional de ferramentas para desenvolvedores ]
        </p>
      </div>
      
      <div className="container mx-auto px-4 pb-16">

        {/* Conteúdo da tab Organizador CSV */}
        {activeTab === 'csv' && (
          <>
            <div className="card p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-center">
                <span className="text-primary">&gt;</span> Organizador CSV
              </h2>
              
              <p className="text-gray-300 mb-6 text-center max-w-3xl mx-auto">
                Ferramenta profissional para importar, organizar e manipular arquivos CSV com facilidade. 
                Pesquise por nome, CPF ou telefone, filtre dados, selecione múltiplas linhas para exclusão 
                e exporte nos formatos desejados. Ideal para análise de dados e gerenciamento de cadastros.
              </p>
              <FileUpload 
                setData={setData} 
                setColumns={setColumns} 
                setFileName={setFileName} 
                setVisibleColumns={setVisibleColumns}
                showNotification={showNotification}
              />
            </div>

            {data.length > 0 && (
              <div className="card p-6">
                <DataTable 
                  data={data} 
                  columns={columns} 
                  setData={setData} 
                  fileName={fileName}
                  visibleColumns={visibleColumns}
                  setVisibleColumns={setVisibleColumns}
                  showNotification={showNotification}
                  setActiveTab={setActiveTab}
                />
              </div>
            )}
          </>
        )}

        {/* Conteúdo da tab Removedor de Metadados */}
        {activeTab === 'metadata' && (
          <div className="card p-6">
            <MetadataRemover 
              showNotification={showNotification}
              setActiveTab={setActiveTab}
            />
          </div>
        )}

        {/* Conteúdo da tab Conversor Typebot */}
        {activeTab === 'typebot' && (
          <div className="card p-6">
            <TypebotConverter 
              showNotification={showNotification}
              setActiveTab={setActiveTab}
            />
          </div>
        )}

        {/* Conteúdo da tab Consulta CPF */}
        {activeTab === 'cpf' && (
          <div className="card p-6">
            <CpfConsulta 
              showNotification={showNotification}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
        
        {/* Conteúdo da tab Encurtador de Links */}
        {activeTab === 'link' && (
          <div className="card p-6">
            <LinkShortener 
              showNotification={showNotification}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
        
        {/* Página Inicial */}
        {activeTab === 'home' && (
          <div className="card p-6">
            <HomePage 
              setActiveTab={setActiveTab}
              showNotification={showNotification}
            />
          </div>
        )}
        
        {/* Conteúdo da tab QR Code */}
        {activeTab === 'qrcode' && (
          <div className="card p-6">
            <QrCodeGenerator 
              showNotification={showNotification}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
        
        {/* Conteúdo da tab Removedor de Fundo */}
        {activeTab === 'bgremove' && (
          <div className="card p-6">
            <BackgroundRemover 
              showNotification={showNotification}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
        
        {/* Conteúdo da tab Conversor de Imagens */}
        {activeTab === 'imgconvert' && (
          <div className="card p-6">
            <ImageConverter 
              showNotification={showNotification}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
        
        {/* Conteúdo da tab Editor HTML */}
        {activeTab === 'htmleditor' && (
          <div className="card p-6">
            <HtmlEditor 
              showNotification={showNotification}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
      </div>

      <Notification 
        show={notification.show} 
        message={notification.message} 
      />
    </main>
  )
}
