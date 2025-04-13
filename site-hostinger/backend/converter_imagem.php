<?php
/**
 * Script para converter imagens entre formatos (JPG, PNG, WebP)
 */

// Verificar se o método é POST e se foi enviado um arquivo
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['imagem'])) {
    // Obter informações do arquivo
    $arquivo = $_FILES['imagem'];
    $nome = $arquivo['name'];
    $tipo = $arquivo['type'];
    $tamanho = $arquivo['size'];
    $erro = $arquivo['error'];
    $tmpPath = $arquivo['tmp_name'];
    
    // Obter formato de destino
    $formatoDestino = isset($_POST['formato']) ? $_POST['formato'] : 'jpg';
    $qualidade = isset($_POST['qualidade']) ? intval($_POST['qualidade']) : 85;
    
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
    
    // Verificar tipo do arquivo (aceitar apenas imagens)
    $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!in_array($tipo, $tiposPermitidos)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Tipo de arquivo não permitido. Apenas imagens (JPG, PNG, GIF, WebP) são aceitas.'
        ]);
        exit;
    }
    
    // Verificar formato de destino
    $formatosPermitidos = ['jpg', 'png', 'webp'];
    if (!in_array($formatoDestino, $formatosPermitidos)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Formato de destino inválido. Escolha entre JPG, PNG ou WebP.'
        ]);
        exit;
    }
    
    // Verificar qualidade
    if ($qualidade < 1 || $qualidade > 100) {
        $qualidade = 85; // Definir qualidade padrão
    }
    
    // Criar diretório para imagens convertidas se não existir
    $diretorioConvertidas = "../converted";
    if (!file_exists($diretorioConvertidas)) {
        mkdir($diretorioConvertidas, 0755, true);
    }
    
    // Gerar nome único para a imagem convertida
    $nomeOriginal = pathinfo($nome, PATHINFO_FILENAME);
    $novoNome = $nomeOriginal . '_' . uniqid() . '.' . $formatoDestino;
    $caminhoFinal = $diretorioConvertidas . '/' . $novoNome;
    
    // Converter a imagem
    if (!converterImagem($tmpPath, $caminhoFinal, $formatoDestino, $qualidade)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Erro ao converter a imagem. Verifique se a extensão GD está habilitada no servidor.'
        ]);
        exit;
    }
    
    // URL para download da imagem convertida
    $urlDownload = getSiteBaseUrl() . '/converted/' . $novoNome;
    
    // Obter tamanho do arquivo convertido
    $tamanhoConvertido = filesize($caminhoFinal);
    
    // Retornar URL para download
    echo json_encode([
        'status' => 'success',
        'message' => 'Imagem convertida com sucesso!',
        'formato_original' => getTipoArquivo($tipo),
        'formato_convertido' => strtoupper($formatoDestino),
        'tamanho_original' => formatarTamanho($tamanho),
        'tamanho_convertido' => formatarTamanho($tamanhoConvertido),
        'qualidade' => $qualidade,
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
 * Função para converter imagem entre formatos
 * @param string $origem Caminho do arquivo original
 * @param string $destino Caminho para salvar o arquivo convertido
 * @param string $formato Formato de destino (jpg, png, webp)
 * @param int $qualidade Qualidade da imagem (1-100)
 * @return bool Sucesso ou falha na conversão
 */
function converterImagem($origem, $destino, $formato, $qualidade) {
    // Verificar se a extensão GD está disponível
    if (!extension_loaded('gd')) {
        return false;
    }
    
    // Detectar o tipo de imagem original
    $infoImagem = getimagesize($origem);
    if ($infoImagem === false) {
        return false;
    }
    
    // Carregar a imagem original
    $imagemOriginal = null;
    switch ($infoImagem[2]) {
        case IMAGETYPE_JPEG:
            $imagemOriginal = imagecreatefromjpeg($origem);
            break;
        case IMAGETYPE_PNG:
            $imagemOriginal = imagecreatefrompng($origem);
            break;
        case IMAGETYPE_GIF:
            $imagemOriginal = imagecreatefromgif($origem);
            break;
        case IMAGETYPE_WEBP:
            $imagemOriginal = imagecreatefromwebp($origem);
            break;
        default:
            return false;
    }
    
    if ($imagemOriginal === false) {
        return false;
    }
    
    // Preservar transparência para PNG
    if ($infoImagem[2] === IMAGETYPE_PNG || $infoImagem[2] === IMAGETYPE_GIF) {
        imagealphablending($imagemOriginal, false);
        imagesavealpha($imagemOriginal, true);
    }
    
    // Salvar a imagem no formato desejado
    $resultado = false;
    switch ($formato) {
        case 'jpg':
            $resultado = imagejpeg($imagemOriginal, $destino, $qualidade);
            break;
        case 'png':
            $compressionLevel = 9 - round(($qualidade / 100) * 9); // Inverte a escala de qualidade para PNG
            $resultado = imagepng($imagemOriginal, $destino, $compressionLevel);
            break;
        case 'webp':
            $resultado = imagewebp($imagemOriginal, $destino, $qualidade);
            break;
    }
    
    // Liberar memória
    imagedestroy($imagemOriginal);
    
    return $resultado;
}

/**
 * Função para obter o tipo de arquivo em formato legível
 * @param string $tipoMime Tipo MIME do arquivo
 * @return string Tipo de arquivo em formato legível
 */
function getTipoArquivo($tipoMime) {
    $tipos = [
        'image/jpeg' => 'JPG',
        'image/jpg' => 'JPG',
        'image/png' => 'PNG',
        'image/gif' => 'GIF',
        'image/webp' => 'WEBP'
    ];
    
    return isset($tipos[$tipoMime]) ? $tipos[$tipoMime] : 'Desconhecido';
}

/**
 * Função para formatar tamanho de arquivo em formato legível
 * @param int $tamanho Tamanho em bytes
 * @return string Tamanho formatado
 */
function formatarTamanho($tamanho) {
    $unidades = ['B', 'KB', 'MB', 'GB', 'TB'];
    $i = 0;
    
    while ($tamanho >= 1024 && $i < 4) {
        $tamanho /= 1024;
        $i++;
    }
    
    return round($tamanho, 2) . ' ' . $unidades[$i];
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
