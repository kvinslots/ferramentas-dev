<?php
/**
 * Script para gerar QR Codes
 */

// Verificar se o método é POST e se os dados foram enviados
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['conteudo'])) {
    // Obter os dados enviados
    $conteudo = trim($_POST['conteudo']);
    $tamanho = isset($_POST['tamanho']) ? intval($_POST['tamanho']) : 300;
    $corPrimaria = isset($_POST['cor_primaria']) ? $_POST['cor_primaria'] : '000000';
    $corFundo = isset($_POST['cor_fundo']) ? $_POST['cor_fundo'] : 'FFFFFF';
    
    // Validar dados
    if (empty($conteudo)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'O conteúdo do QR Code não pode estar vazio.'
        ]);
        exit;
    }
    
    // Limitar tamanho
    if ($tamanho < 100 || $tamanho > 1000) {
        $tamanho = 300; // Tamanho padrão
    }
    
    // Limpar cores (remover # se presente)
    $corPrimaria = str_replace('#', '', $corPrimaria);
    $corFundo = str_replace('#', '', $corFundo);
    
    // Usar a Google Chart API para gerar o QR Code
    $url = "https://chart.googleapis.com/chart?cht=qr&chs={$tamanho}x{$tamanho}&chl=" . urlencode($conteudo) . "&chco={$corPrimaria}&chf=bg,s,{$corFundo}";
    
    // ID único para o arquivo
    $uniqueId = uniqid();
    $fileName = "qrcode_{$uniqueId}.png";
    $filePath = "../images/qrcodes/{$fileName}";
    
    // Criar diretório se não existir
    if (!file_exists("../images/qrcodes")) {
        mkdir("../images/qrcodes", 0755, true);
    }
    
    // Baixar a imagem e salvá-la localmente
    $qrCodeImage = file_get_contents($url);
    file_put_contents($filePath, $qrCodeImage);
    
    // URL completa para o QR Code
    $qrCodeUrl = getSiteBaseUrl() . "/images/qrcodes/{$fileName}";
    
    // Retornar dados
    echo json_encode([
        'status' => 'success',
        'message' => 'QR Code gerado com sucesso!',
        'qrcode_url' => $qrCodeUrl,
        'qrcode_file' => $fileName
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
