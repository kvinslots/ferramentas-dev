<?php
/**
 * Arquivo principal de backend para processamento de requisições
 * Este arquivo coordena as diferentes funções e redirecionamentos
 */

// Definir headers para permitir acesso
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Verificar o tipo de ação solicitada
$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : '';

// Processar ação solicitada
switch ($action) {
    case 'consulta_cpf':
        include 'backend/consulta_cpf.php';
        break;

    case 'encurtar_link':
        include 'backend/encurtar_link.php';
        break;

    case 'gerar_qrcode':
        include 'backend/gerar_qrcode.php';
        break;

    case 'remover_metadados':
        include 'backend/remover_metadados.php';
        break;
        
    case 'converter_imagem':
        include 'backend/converter_imagem.php';
        break;
        
    case 'remover_fundo':
        include 'backend/remover_fundo.php';
        break;
        
    case 'converter_typebot':
        include 'backend/converter_typebot.php';
        break;
        
    default:
        // Resposta padrão se nenhuma ação foi especificada
        echo json_encode([
            'status' => 'error',
            'message' => 'Ação não especificada ou inválida'
        ]);
}
?>
