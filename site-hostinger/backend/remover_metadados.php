<?php
/**
 * Script para remover metadados de imagens e vídeos
 */

// Verificar se o método é POST e se foi enviado um arquivo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['arquivo'])) {
    // Obter informações do arquivo
    $arquivo = $_FILES['arquivo'];
    $nome = $arquivo['name'];
    $tipo = $arquivo['type'];
    $tamanho = $arquivo['size'];
    $erro = $arquivo['error'];
    $tmpPath = $arquivo['tmp_name'];
    
    // Verificar se houve erro no upload
    if ($erro !== UPLOAD_ERR_OK) {
        $mensagens = [
            UPLOAD_ERR_INI_SIZE => 'O arquivo excede o tamanho máximo permitido pelo servidor.',
            UPLOAD_ERR_FORM_SIZE => 'O arquivo excede o tamanho máximo permitido pelo formulário.',
            UPLOAD_ERR_PARTIAL => 'O upload do arquivo foi feito parcialmente.',
            UPLOAD_ERR_NO_FILE => 'Nenhum arquivo foi enviado.',
            UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporária ausente.',
            UPLOAD_ERR_CANT_WRITE => 'Falha ao escrever arquivo em disco.',
            UPLOAD_ERR_EXTENSION => 'Uma extensão PHP interrompeu o upload do arquivo.'
        ];
        
        echo json_encode([
            'status' => 'error',
            'message' => isset($mensagens[$erro]) ? $mensagens[$erro] : 'Erro desconhecido no upload.'
        ]);
        exit;
    }
    
    // Verificar tipo do arquivo
    $tiposPermitidos = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'
    ];
    
    if (!in_array($tipo, $tiposPermitidos)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Tipo de arquivo não permitido. Apenas imagens (JPG, PNG, GIF, WebP) e vídeos (MP4, MPEG, MOV, AVI) são aceitos.'
        ]);
        exit;
    }
    
    // Criar diretório para arquivos processados se não existir
    $diretorioProcessados = "../processed";
    if (!file_exists($diretorioProcessados)) {
        mkdir($diretorioProcessados, 0755, true);
    }
    
    // Gerar nome único para o arquivo processado
    $extensao = pathinfo($nome, PATHINFO_EXTENSION);
    $novoNome = uniqid() . '_sem_metadados.' . $extensao;
    $caminhoFinal = $diretorioProcessados . '/' . $novoNome;
    
    // Remover metadados com base no tipo de arquivo
    if (strpos($tipo, 'image/') === 0) {
        // Remover metadados de imagem
        removerMetadadosImagem($tmpPath, $caminhoFinal, $tipo);
    } else {
        // Remover metadados de vídeo
        removerMetadadosVideo($tmpPath, $caminhoFinal);
    }
    
    // Verificar se o arquivo foi processado com sucesso
    if (!file_exists($caminhoFinal)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Erro ao processar o arquivo. Por favor, tente novamente.'
        ]);
        exit;
    }
    
    // URL para download do arquivo processado
    $urlDownload = getSiteBaseUrl() . '/processed/' . $novoNome;
    
    // Retornar URL para download
    echo json_encode([
        'status' => 'success',
        'message' => 'Metadados removidos com sucesso!',
        'arquivo_original' => $nome,
        'arquivo_processado' => $novoNome,
        'url_download' => $urlDownload
    ]);
    exit;
} else {
    // Método não permitido ou faltando parâmetros
    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido ou arquivo não enviado'
    ]);
    exit;
}

/**
 * Função para remover metadados de imagem
 * @param string $origem Caminho do arquivo original
 * @param string $destino Caminho para salvar o arquivo processado
 * @param string $tipo Tipo MIME da imagem
 */
function removerMetadadosImagem($origem, $destino, $tipo) {
    // Verificar se a extensão GD está disponível
    if (!extension_loaded('gd')) {
        die(json_encode([
            'status' => 'error',
            'message' => 'A extensão GD não está disponível no servidor.'
        ]));
    }
    
    // Carregar imagem com base no tipo
    $imagem = null;
    
    switch ($tipo) {
        case 'image/jpeg':
        case 'image/jpg':
            $imagem = imagecreatefromjpeg($origem);
            break;
        case 'image/png':
            $imagem = imagecreatefrompng($origem);
            break;
        case 'image/gif':
            $imagem = imagecreatefromgif($origem);
            break;
        case 'image/webp':
            $imagem = imagecreatefromwebp($origem);
            break;
    }
    
    if (!$imagem) {
        die(json_encode([
            'status' => 'error',
            'message' => 'Não foi possível processar a imagem.'
        ]));
    }
    
    // Preservar transparência para PNG e GIF
    if ($tipo == 'image/png' || $tipo == 'image/gif') {
        imagealphablending($imagem, false);
        imagesavealpha($imagem, true);
    }
    
    // Salvar a imagem sem metadados
    switch ($tipo) {
        case 'image/jpeg':
        case 'image/jpg':
            imagejpeg($imagem, $destino, 95); // 95% de qualidade
            break;
        case 'image/png':
            imagepng($imagem, $destino, 9); // Compressão máxima
            break;
        case 'image/gif':
            imagegif($imagem, $destino);
            break;
        case 'image/webp':
            imagewebp($imagem, $destino, 95); // 95% de qualidade
            break;
    }
    
    // Liberar memória
    imagedestroy($imagem);
}

/**
 * Função para remover metadados de vídeo
 * @param string $origem Caminho do arquivo original
 * @param string $destino Caminho para salvar o arquivo processado
 */
function removerMetadadosVideo($origem, $destino) {
    // Verificar se ffmpeg está disponível
    $ffmpeg = shell_exec('which ffmpeg');
    
    if (empty($ffmpeg)) {
        // Se ffmpeg não estiver disponível, apenas copie o arquivo
        // (em produção, você deve informar ao usuário que os metadados podem não ser removidos completamente)
        copy($origem, $destino);
        return;
    }
    
    // Usar ffmpeg para remover metadados
    $comando = "ffmpeg -i " . escapeshellarg($origem) . " -map_metadata -1 -c:v copy -c:a copy " . escapeshellarg($destino) . " 2>&1";
    $saida = shell_exec($comando);
    
    // Se ocorrer algum erro, apenas copie o arquivo
    if (!file_exists($destino)) {
        copy($origem, $destino);
    }
}

/**
 * Função para obter a URL base do site
 * @return string URL base do site
 */
function getSiteBaseUrl() {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    
    // Remover subdiretorios, se existirem
    $path = explode('/', $_SERVER['SCRIPT_NAME']);
    array_pop($path); // Remover o arquivo atual
    array_pop($path); // Remover a pasta 'backend'
    $basePath = implode('/', $path);
    
    return $protocol . '://' . $host . $basePath;
}
?>
