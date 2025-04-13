<?php
/**
 * Script para encurtar links
 */

// Verificar se o método é POST e se o link foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['url'])) {
    // Obter a URL enviada
    $url = trim($_POST['url']);
    
    // Verificar se a URL é válida
    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'URL inválida. Por favor, insira uma URL válida.'
        ]);
        exit;
    }
    
    // Verificar se o arquivo de URLs encurtadas existe
    $dbFile = '../data/shortened_urls.json';
    $shortenedUrls = [];
    
    // Criar diretório se não existir
    if (!file_exists('../data')) {
        mkdir('../data', 0755, true);
    }
    
    // Carregar URLs já encurtadas, se existirem
    if (file_exists($dbFile)) {
        $shortenedUrls = json_decode(file_get_contents($dbFile), true);
    }
    
    // Gerar código único para a URL encurtada
    $code = generateUniqueCode($shortenedUrls);
    
    // Montar a URL encurtada
    $shortenedUrl = getSiteBaseUrl() . '/r/' . $code;
    
    // Adicionar a nova URL ao banco de dados
    $shortenedUrls[$code] = [
        'original_url' => $url,
        'created_at' => date('Y-m-d H:i:s'),
        'clicks' => 0
    ];
    
    // Salvar o banco de dados atualizado
    file_put_contents($dbFile, json_encode($shortenedUrls, JSON_PRETTY_PRINT));
    
    // Retornar a URL encurtada
    echo json_encode([
        'status' => 'success',
        'original_url' => $url,
        'shortened_url' => $shortenedUrl
    ]);
    exit;
} else {
    // Método não permitido ou faltando parâmetros
    echo json_encode([
        'status' => 'error',
        'message' => 'Método não permitido ou parâmetros ausentes'
    ]);
    exit;
}

/**
 * Função para gerar um código único para a URL encurtada
 * @param array $existingCodes Array com códigos já existentes
 * @param int $length Comprimento do código
 * @return string Código único
 */
function generateUniqueCode($existingCodes, $length = 6) {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $code = '';
    
    do {
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $chars[rand(0, strlen($chars) - 1)];
        }
    } while (isset($existingCodes[$code]));
    
    return $code;
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
