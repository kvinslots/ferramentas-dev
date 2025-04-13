<?php
/**
 * Arquivo principal de servidor para roteamento de requisições
 * Este arquivo facilita a integração com o servidor da Hostinger
 */

// Verificar o tipo de requisição
$requestUri = $_SERVER['REQUEST_URI'];
$baseFolder = dirname($_SERVER['SCRIPT_NAME']);

// Remover o caminho base da URI
if ($baseFolder !== '/' && strpos($requestUri, $baseFolder) === 0) {
    $requestUri = substr($requestUri, strlen($baseFolder));
}

// Limpar a URI
$requestUri = parse_url($requestUri, PHP_URL_PATH);

// Verificar se é uma requisição para a API
if (strpos($requestUri, '/api/') === 0) {
    // Redirecionar para o manipulador de API correto
    $endpoint = substr($requestUri, 5); // Remove "/api/"
    
    switch ($endpoint) {
        case 'consulta-cpf':
            include 'backend/consulta_cpf.php';
            break;
            
        case 'encurtar-link':
            include 'backend/encurtar_link.php';
            break;
            
        case 'gerar-qrcode':
            include 'backend/gerar_qrcode.php';
            break;
            
        case 'remover-metadados':
            include 'backend/remover_metadados.php';
            break;
            
        case 'converter-imagem':
            include 'backend/converter_imagem.php';
            break;
            
        case 'remover-fundo':
            include 'backend/remover_fundo.php';
            break;
            
        case 'converter-typebot':
            include 'backend/converter_typebot.php';
            break;
            
        default:
            // API endpoint não encontrado
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['status' => 'error', 'message' => 'API endpoint não encontrado']);
    }
    exit;
}

// Se for uma requisição para URL encurtada
if (strpos($requestUri, '/r/') === 0) {
    // Extrair o código
    $code = substr($requestUri, 3);
    
    // Adicionar o código como parâmetro GET e incluir o redirecionador
    $_GET['code'] = $code;
    include 'r.php';
    exit;
}

// Para todas as outras requisições, verificar se o arquivo existe
$requestFile = __DIR__ . $requestUri;

if (file_exists($requestFile) && !is_dir($requestFile)) {
    // Se for um arquivo PHP, incluí-lo
    if (pathinfo($requestFile, PATHINFO_EXTENSION) === 'php') {
        include $requestFile;
        exit;
    }
    
    // Para outros tipos de arquivo, definir o tipo MIME correto
    $extension = pathinfo($requestFile, PATHINFO_EXTENSION);
    $contentType = 'text/plain';
    
    switch ($extension) {
        case 'html':
            $contentType = 'text/html';
            break;
        case 'css':
            $contentType = 'text/css';
            break;
        case 'js':
            $contentType = 'application/javascript';
            break;
        case 'json':
            $contentType = 'application/json';
            break;
        case 'png':
            $contentType = 'image/png';
            break;
        case 'jpg':
        case 'jpeg':
            $contentType = 'image/jpeg';
            break;
        case 'gif':
            $contentType = 'image/gif';
            break;
        case 'svg':
            $contentType = 'image/svg+xml';
            break;
        case 'ico':
            $contentType = 'image/x-icon';
            break;
    }
    
    header('Content-Type: ' . $contentType);
    readfile($requestFile);
    exit;
}

// Se chegou aqui, redirecionar para o index.html
include __DIR__ . '/index.html';
?>
