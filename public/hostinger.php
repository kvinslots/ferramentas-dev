<?php
// Script para configurar corretamente o site Next.js na Hostinger
// Coloque este arquivo na raiz do seu site

// Definir headers para permitir acesso
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Verificar se é uma rota de API
$requestUri = $_SERVER['REQUEST_URI'];
if (strpos($requestUri, '/api/') !== false) {
    // Redirecionar para o arquivo PHP específico da API, se tiver implementado
    header("Location: /api.php");
    exit;
}

// Verificar se o arquivo solicitado existe
$filePath = __DIR__ . $requestUri;
if (file_exists($filePath) && !is_dir($filePath)) {
    // Se o arquivo existe, apenas retorne-o
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    
    // Definir o tipo MIME correto baseado na extensão
    switch ($extension) {
        case 'css':
            header("Content-Type: text/css");
            break;
        case 'js':
            header("Content-Type: application/javascript");
            break;
        case 'json':
            header("Content-Type: application/json");
            break;
        case 'png':
            header("Content-Type: image/png");
            break;
        case 'jpg':
        case 'jpeg':
            header("Content-Type: image/jpeg");
            break;
        case 'svg':
            header("Content-Type: image/svg+xml");
            break;
    }
    
    // Enviar o arquivo
    readfile($filePath);
    exit;
}

// Se chegou aqui, redirecionar para o index.html
include_once(__DIR__ . '/index.html');
?>
