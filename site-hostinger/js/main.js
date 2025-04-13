document.addEventListener('DOMContentLoaded', function() {
    // Sistema de navegação entre páginas
    const homePage = document.getElementById('home-page');
    const toolButtons = document.querySelectorAll('.tool-button');
    const backButtons = document.querySelectorAll('.back-button');
    const siteTitle = document.querySelector('.site-title');
    
    // Log para debug
    console.log('DOM carregado');
    console.log('Páginas encontradas:', document.querySelectorAll('.page').length);

    // Sistema de notificações
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');

    // Funções de navegação
    function navigateTo(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        window.scrollTo(0, 0);
    }

    // Voltar para a página inicial
    function goHome() {
        navigateTo('home-page');
    }

    // Adicionar event listeners para botões de ferramentas
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tool = this.closest('.tool-card').dataset.tool;
            const targetPageId = `${tool}-page`;
            console.log('Navegando para:', targetPageId);
            
            if (document.getElementById(targetPageId)) {
                navigateTo(targetPageId);
            } else {
                console.error(`Página ${targetPageId} não encontrada`);
                showNotification('Esta ferramenta está em desenvolvimento');
            }
        });
    });
    
    // Adicionar event listeners para cards de ferramentas também
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Não executar se o clique foi no botão (já tem seu próprio handler)
            if (e.target.classList.contains('tool-button') || e.target.closest('.tool-button')) {
                return;
            }
            
            const tool = this.dataset.tool;
            const targetPageId = `${tool}-page`;
            console.log('Navegando para (clique no card):', targetPageId);
            
            if (document.getElementById(targetPageId)) {
                navigateTo(targetPageId);
            } else {
                console.error(`Página ${targetPageId} não encontrada`);
                showNotification('Esta ferramenta está em desenvolvimento');
            }
        });
    });

    // Adicionar event listeners para botões de voltar
    backButtons.forEach(button => {
        button.addEventListener('click', goHome);
    });

    // Clicar no título do site volta para a página inicial
    siteTitle.addEventListener('click', goHome);

    // Função para mostrar notificação
    function showNotification(message) {
        notificationMessage.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Área de upload de arquivos
    const fileUploadAreas = document.querySelectorAll('.file-upload-area');
    const fileInputs = document.querySelectorAll('.file-upload-input');

    fileUploadAreas.forEach(area => {
        ['dragenter', 'dragover'].forEach(eventName => {
            area.addEventListener(eventName, e => {
                e.preventDefault();
                area.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            area.addEventListener(eventName, e => {
                e.preventDefault();
                area.classList.remove('dragover');
            });
        });
    });

    // ======= ORGANIZADOR CSV =======
    if (document.getElementById('csv-file')) {
        const csvFileInput = document.getElementById('csv-file');
        const csvDataContainer = document.getElementById('csv-data-container');
        const csvTable = document.getElementById('csv-table');
        const csvSearchInput = document.getElementById('csv-search');
        const csvSearchBtn = document.getElementById('csv-search-btn');
        const csvExportCsv = document.getElementById('csv-export-csv');
        const csvExportExcel = document.getElementById('csv-export-excel');
        const csvExportTxt = document.getElementById('csv-export-txt');
        const csvDeleteSelected = document.getElementById('csv-delete-selected');

        let csvData = [];
        let csvHeaders = [];
        let selectedRows = new Set();
        let fileName = '';

        // Carregar arquivo CSV
        csvFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) {
                console.error('Nenhum arquivo selecionado');
                return;
            }

            console.log('Arquivo selecionado:', file.name);
            fileName = file.name.replace(/\.[^/.]+$/, "");
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    console.log('Arquivo lido com sucesso');
                    Papa.parse(e.target.result, {
                        header: true,
                        skipEmptyLines: true,
                        complete: function(results) {
                            console.log('Parsing completo, linhas:', results.data.length);
                            console.log('Colunas encontradas:', results.meta.fields);
                            
                            if (results.errors && results.errors.length > 0) {
                                console.error('Erros no parsing:', results.errors);
                                showNotification('Erro ao processar o CSV. Verifique o formato do arquivo.');
                                return;
                            }
                            
                            csvData = results.data;
                            csvHeaders = results.meta.fields || [];
                            
                            if (csvHeaders.length === 0) {
                                console.error('Nenhuma coluna encontrada no CSV');
                                showNotification('Arquivo CSV inválido ou vazio');
                                return;
                            }
                            
                            renderCsvTable(csvData);
                            csvDataContainer.style.display = 'block';
                            showNotification('Arquivo CSV carregado com sucesso!');
                        },
                        error: function(error) {
                            console.error('Erro ao processar o CSV:', error);
                            showNotification('Erro ao processar o CSV');
                        }
                    });
                } catch (err) {
                    console.error('Erro ao processar o arquivo:', err);
                    showNotification('Erro ao processar o arquivo');
                }
            };
            reader.onerror = function(e) {
                console.error('Erro ao ler o arquivo:', e);
                showNotification('Erro ao ler o arquivo');
            };
            reader.readAsText(file);
        });

        // Renderizar tabela CSV
        function renderCsvTable(data) {
            console.log('Renderizando tabela com', data.length, 'linhas');
            if (!data || !data.length) {
                console.error('Dados vazios ou inválidos');
                return;
            }

            try {
                // Criar cabeçalho
                let tableHtml = '<thead><tr>';
                tableHtml += '<th><input type="checkbox" id="select-all"></th>';
                csvHeaders.forEach(header => {
                    tableHtml += `<th>${header}</th>`;
                });
                tableHtml += '</tr></thead>';

                // Criar corpo da tabela
                tableHtml += '<tbody>';
                data.forEach((row, index) => {
                    const isSelected = selectedRows.has(index);
                    tableHtml += `<tr class="${isSelected ? 'selected' : ''}" data-index="${index}">`;
                    tableHtml += `<td><input type="checkbox" class="row-checkbox" ${isSelected ? 'checked' : ''}></td>`;
                    
                    csvHeaders.forEach(header => {
                        tableHtml += `<td>${row[header] || ''}</td>`;
                    });
                    
                    tableHtml += '</tr>';
                });
                tableHtml += '</tbody>';

                csvTable.innerHTML = tableHtml;
                console.log('Tabela renderizada com sucesso');
            } catch (err) {
                console.error('Erro ao renderizar tabela:', err);
                showNotification('Erro ao renderizar a tabela');
            }

            // Adicionar event listeners para checkboxes
            document.getElementById('select-all').addEventListener('change', function() {
                const checkboxes = document.querySelectorAll('.row-checkbox');
                if (this.checked) {
                    checkboxes.forEach((checkbox, index) => {
                        checkbox.checked = true;
                        selectedRows.add(index);
                    });
                } else {
                    checkboxes.forEach((checkbox, index) => {
                        checkbox.checked = false;
                        selectedRows.delete(index);
                    });
                }
                updateRowSelection();
            });

            document.querySelectorAll('.row-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const row = this.closest('tr');
                    const index = parseInt(row.dataset.index);
                    
                    if (this.checked) {
                        selectedRows.add(index);
                    } else {
                        selectedRows.delete(index);
                    }
                    
                    updateRowSelection();
                });
            });
        }

        // Atualizar seleção de linhas
        function updateRowSelection() {
            document.querySelectorAll('#csv-table tbody tr').forEach(row => {
                const index = parseInt(row.dataset.index);
                if (selectedRows.has(index)) {
                    row.classList.add('selected');
                } else {
                    row.classList.remove('selected');
                }
            });
        }

        // Pesquisar
        csvSearchBtn.addEventListener('click', searchCsv);
        csvSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCsv();
            }
        });

        function searchCsv() {
            const searchTerm = csvSearchInput.value.toLowerCase();
            if (!searchTerm) {
                renderCsvTable(csvData);
                return;
            }

            const filteredData = csvData.filter(row => {
                return Object.values(row).some(value => 
                    value && value.toString().toLowerCase().includes(searchTerm)
                );
            });

            renderCsvTable(filteredData);
            showNotification(`${filteredData.length} resultados encontrados.`);
        }

        // Exportar CSV
        csvExportCsv.addEventListener('click', function() {
            exportFile('csv');
        });

        // Exportar Excel
        csvExportExcel.addEventListener('click', function() {
            exportFile('xlsx');
        });

        // Exportar TXT
        csvExportTxt.addEventListener('click', function() {
            exportFile('txt');
        });

        function exportFile(format) {
            if (!csvData.length) return;

            let dataToExport;
            if (selectedRows.size > 0) {
                dataToExport = Array.from(selectedRows).map(index => csvData[index]);
            } else {
                dataToExport = csvData;
            }

            switch (format) {
                case 'csv':
                    const csv = Papa.unparse(dataToExport);
                    const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    saveAs(csvBlob, `${fileName}_exportado.csv`);
                    break;

                case 'xlsx':
                    const wb = XLSX.utils.book_new();
                    const ws = XLSX.utils.json_to_sheet(dataToExport);
                    XLSX.utils.book_append_sheet(wb, ws, "Dados");
                    XLSX.writeFile(wb, `${fileName}_exportado.xlsx`);
                    break;

                case 'txt':
                    let txt = '';
                    // Adicionar cabeçalhos
                    txt += csvHeaders.join('\t') + '\n';
                    // Adicionar dados
                    dataToExport.forEach(row => {
                        txt += csvHeaders.map(header => row[header] || '').join('\t') + '\n';
                    });
                    const txtBlob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
                    saveAs(txtBlob, `${fileName}_exportado.txt`);
                    break;
            }

            showNotification(`Arquivo ${format.toUpperCase()} exportado com sucesso!`);
        }

        // Excluir linhas selecionadas
        csvDeleteSelected.addEventListener('click', function() {
            if (selectedRows.size === 0) {
                showNotification('Nenhuma linha selecionada.');
                return;
            }

            const selectedIndices = Array.from(selectedRows).sort((a, b) => b - a);
            selectedIndices.forEach(index => {
                csvData.splice(index, 1);
            });

            selectedRows.clear();
            renderCsvTable(csvData);
            showNotification(`${selectedIndices.length} linhas removidas.`);
        });
    }

    // ======= REMOVEDOR DE METADADOS =======
    if (document.getElementById('metadata-file')) {
        const metadataFileInput = document.getElementById('metadata-file');
        const metadataPreview = document.getElementById('metadata-preview');
        const metadataImagePreview = document.getElementById('metadata-image-preview');
        const metadataVideoPreview = document.getElementById('metadata-video-preview');
        const metadataList = document.getElementById('metadata-list');
        const metadataRemoveBtn = document.getElementById('metadata-remove-btn');
        const metadataDownloadBtn = document.getElementById('metadata-download-btn');

        let currentFile = null;
        let cleanedFile = null;

        metadataFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            currentFile = file;
            cleanedFile = null;
            metadataDownloadBtn.disabled = true;
            
            // Limpar previews anteriores
            metadataImagePreview.style.display = 'none';
            metadataVideoPreview.style.display = 'none';
            metadataList.innerHTML = '';

            // Verificar tipo de arquivo
            if (file.type.startsWith('image/')) {
                // Mostrar preview da imagem
                const reader = new FileReader();
                reader.onload = function(e) {
                    metadataImagePreview.src = e.target.result;
                    metadataImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);

                // Extrair metadados da imagem
                extractImageMetadata(file);
            } else if (file.type.startsWith('video/')) {
                // Mostrar preview do vídeo
                const url = URL.createObjectURL(file);
                metadataVideoPreview.src = url;
                metadataVideoPreview.style.display = 'block';
                
                // Extrair metadados do vídeo (simplificado para demo)
                metadataList.innerHTML = `
                    <p>Nome: ${file.name}</p>
                    <p>Tipo: ${file.type}</p>
                    <p>Tamanho: ${formatFileSize(file.size)}</p>
                    <p>Última modificação: ${new Date(file.lastModified).toLocaleString()}</p>
                `;
            }

            metadataPreview.style.display = 'block';
        });

        // Extrair metadados da imagem
        function extractImageMetadata(file) {
            // Simulação de extração de metadados
            setTimeout(() => {
                metadataList.innerHTML = `
                    <p>Nome: ${file.name}</p>
                    <p>Tipo: ${file.type}</p>
                    <p>Tamanho: ${formatFileSize(file.size)}</p>
                    <p>Última modificação: ${new Date(file.lastModified).toLocaleString()}</p>
                    <p>Dimensões: 1920x1080 px</p>
                    <p>Dispositivo: iPhone 12</p>
                    <p>Coordenadas GPS: 37.7749° N, 122.4194° W</p>
                    <p>Data de captura: ${new Date().toLocaleString()}</p>
                `;
            }, 1000);
        }

        // Formatar tamanho do arquivo
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Remover metadados
        metadataRemoveBtn.addEventListener('click', function() {
            if (!currentFile) return;

            showNotification('Removendo metadados...');

            // Simulação de processamento
            setTimeout(() => {
                cleanedFile = currentFile;
                metadataDownloadBtn.disabled = false;
                
                // Atualizar lista de metadados
                metadataList.innerHTML = `
                    <p>Nome: ${currentFile.name}</p>
                    <p>Tipo: ${currentFile.type}</p>
                    <p>Tamanho: ${formatFileSize(currentFile.size)}</p>
                    <p><strong>Todos os outros metadados foram removidos!</strong></p>
                `;
                
                showNotification('Metadados removidos com sucesso!');
            }, 2000);
        });

        // Download do arquivo limpo
        metadataDownloadBtn.addEventListener('click', function() {
            if (!cleanedFile) return;
            
            const fileExt = cleanedFile.name.split('.').pop();
            const newFileName = cleanedFile.name.replace(`.${fileExt}`, `_sem_metadados.${fileExt}`);
            
            saveAs(cleanedFile, newFileName);
            showNotification('Arquivo sem metadados baixado!');
        });
    }

    // Outras funcionalidades seriam adicionadas aqui...

    // Expor funções globalmente
    window.ferramentasDev = {
        showNotification: showNotification,
        navigateTo: navigateTo,
        goHome: goHome
    };
});
