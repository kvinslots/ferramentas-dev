<?php
/**
 * Script para redirecionar links encurtados
 */

// Obter o código da URL
$code = isset($_GET['code']) ? $_GET['code'] : '';

// Se não houver código, redirecionar para a página inicial
if (empty($code)) {
    header('Location: index.html');
    exit;
}

// Verificar se o arquivo de URLs encurtadas existe
$dbFile = 'data/shortened_urls.json';
if (!file_exists($dbFile)) {
    // Se não existir, redirecionar para a página inicial
    header('Location: index.html');
    exit;
}

// Carregar URLs encurtadas
$shortenedUrls = json_decode(file_get_contents($dbFile), true);

// Verificar se o código existe
if (!isset($shortenedUrls[$code])) {
    // Código não encontrado, redirecionar para a página inicial
    header('Location: index.html');
    exit;
}

// Incrementar contador de cliques
$shortenedUrls[$code]['clicks']++;

// Salvar o banco de dados atualizado
file_put_contents($dbFile, json_encode($shortenedUrls, JSON_PRETTY_PRINT));

// Redirecionar para a URL original
header('Location: ' . $shortenedUrls[$code]['original_url']);
exit;
?>
