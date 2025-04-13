<?php
/**
 * Script para remover o fundo de imagens
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
    
    // Obter configurações
    $tolerancia = isset($_POST['tolerancia']) ? intval($_POST['tolerancia']) : 30;
    
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
    
    // Criar diretório para imagens processadas se não existir
    $diretorioProcessadas = "../backgrounds";
    if (!file_exists($diretorioProcessadas)) {
        mkdir($diretorioProcessadas, 0755, true);
    }
    
    // Gerar nome único para a imagem processada
    $nomeOriginal = pathinfo($nome, PATHINFO_FILENAME);
    $novoNome = $nomeOriginal . '_sem_fundo_' . uniqid() . '.png'; // Sempre salvar como PNG para preservar transparência
    $caminhoFinal = $diretorioProcessadas . '/' . $novoNome;
    
    // Remover o fundo da imagem
    if (!removerFundoImagem($tmpPath, $caminhoFinal, $tolerancia)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Erro ao remover o fundo da imagem. Verifique se a extensão GD está habilitada no servidor.'
        ]);
        exit;
    }
    
    // URL para download da imagem processada
    $urlDownload = getSiteBaseUrl() . '/backgrounds/' . $novoNome;
    
    // Retornar URL para download
    echo json_encode([
        'status' => 'success',
        'message' => 'Fundo removido com sucesso!',
        'imagem_original' => $nome,
        'imagem_processada' => $novoNome,
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
 * Função para remover o fundo de uma imagem
 * @param string $origem Caminho do arquivo original
 * @param string $destino Caminho para salvar o arquivo processado
 * @param int $tolerancia Tolerância para remoção de fundo (0-255)
 * @return bool Sucesso ou falha na remoção
 */
function removerFundoImagem($origem, $destino, $tolerancia = 30) {
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
    
    // Obter dimensões da imagem
    $largura = imagesx($imagemOriginal);
    $altura = imagesy($imagemOriginal);
    
    // Criar nova imagem com canal alfa
    $imagemNova = imagecreatetruecolor($largura, $altura);
    imagealphablending($imagemNova, false);
    imagesavealpha($imagemNova, true);
    
    // Preencher a nova imagem com transparência
    $transparente = imagecolorallocatealpha($imagemNova, 0, 0, 0, 127);
    imagefill($imagemNova, 0, 0, $transparente);
    
    // Obter a cor do pixel no canto superior esquerdo (assumido como cor de fundo)
    $corFundo = imagecolorat($imagemOriginal, 0, 0);
    $r1 = ($corFundo >> 16) & 0xFF;
    $g1 = ($corFundo >> 8) & 0xFF;
    $b1 = $corFundo & 0xFF;
    
    // Processo básico de remoção de fundo
    for ($y = 0; $y < $altura; $y++) {
        for ($x = 0; $x < $largura; $x++) {
            $cor = imagecolorat($imagemOriginal, $x, $y);
            $r2 = ($cor >> 16) & 0xFF;
            $g2 = ($cor >> 8) & 0xFF;
            $b2 = $cor & 0xFF;
            
            // Calcular diferença de cor
            $diff = sqrt(pow($r2 - $r1, 2) + pow($g2 - $g1, 2) + pow($b2 - $b1, 2));
            
            // Se a diferença for menor que a tolerância, tornar o pixel transparente
            if ($diff < $tolerancia) {
                $alpha = 127; // Totalmente transparente
            } else {
                $alpha = 0; // Totalmente opaco
            }
            
            $novoPixel = imagecolorallocatealpha($imagemNova, $r2, $g2, $b2, $alpha);
            imagesetpixel($imagemNova, $x, $y, $novoPixel);
        }
    }
    
    // Salvar a imagem no formato PNG com transparência
    $resultado = imagepng($imagemNova, $destino, 9); // Usar compressão máxima (9)
    
    // Liberar memória
    imagedestroy($imagemOriginal);
    imagedestroy($imagemNova);
    
    return $resultado;
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
